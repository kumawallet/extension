import Record from "@src/storage/entities/activity/Record";
import { TxProvider, reducer, useTxContext } from "./TxProvider";
import { RecordStatus, RecordType } from "@src/storage/entities/activity/types";
import { selectedWASMAccountMock } from "@src/tests/mocks/account-mocks";
import {
  selectedEVMChainMock,
  selectedWASMChainMock,
} from "@src/tests/mocks/chain-mocks";
import { render } from "@testing-library/react";

const activiyMock: Partial<Record>[] = [
  {
    hash: "0x123",
    status: RecordStatus.PENDING,
    error: undefined,
    network: "mainnet",
    type: RecordType.TRANSFER,
    address: "0x123",
    recipientNetwork: "mainnet",
    reference: "WASM",
    data: {
      asset: {
        id: "1",
        color: "#ffff",
      },
      symbol: "DOT",
      from: "0xOrigin",
      to: "0xDestination",
      value: "100",
      gas: "0",
      gasPrice: "0",
      data: "data",
    },
  },
];

const initialState = {
  activity: [],
};

const testIds = {
  activity: "activity",
};

const TestComponent = () => {
  const {
    state: { activity },
  } = useTxContext();

  return (
    <>
      <div data-testid={testIds.activity}>{JSON.stringify(activity)}</div>
    </>
  );
};

const renderComponent = () => {
  return render(
    <TxProvider>
      <TestComponent />
    </TxProvider>
  );
};

describe("TxProvider", () => {
  beforeAll(() => {
    vi.mock("@src/providers", () => ({
      useNetworkContext: () => ({
        state: {
          api: {
            rpc: {
              chain: {
                getBlockHash: () => 1,
                getBlock: () => ({
                  block: {
                    extrinsics: {
                      entries: () => [
                        {
                          hash: "0x123",
                        },
                      ],
                    },
                  },
                }),
              },
            },
            registry: {
              findMetaError: () => ({
                section: "section",
                name: "name",
              }),
            },
            events: {
              system: {
                ExtrinsicSuccess: {
                  is: () => false,
                },
                ExtrinsicFailed: {
                  is: () => true,
                },
              },
            },
            at: () => ({
              query: {
                system: {
                  events: () => [
                    {
                      phase: {
                        isApplyExtrinsic: true,
                        asApplyExtrinsic: {
                          eq: () => true,
                        },
                      },
                      event: {
                        // data: [dispatchError]
                        data: [
                          {
                            isModule: true,
                            asModule: {},
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            }),
          },
          selectedChain: selectedWASMChainMock,
        },
      }),
      useAccountContext: () => ({
        state: {
          selectedAccount: selectedWASMAccountMock,
        },
      }),
    }));

    vi.mock("@src/Extension");

    // mock chrome.runtime
    global.chrome = {
      runtime: {
        onMessage: {
          addListener: () => null,
          removeListener: () => null,
        },
      },
    } as any;
  });

  it("should load wasm activity", async () => {
    const _Extension = (await import("@src/Extension")).default;
    _Extension.getActivity = vi.fn().mockReturnValue(activiyMock);

    const providers = await import("@src/providers");
    providers.useNetworkContext = () =>
      ({
        state: {
          api: {
            registry: {
              findMetaError: () => ({
                section: "section",
                name: "name",
              }),
            },
            events: {
              system: {
                ExtrinsicSuccess: {
                  is: () => false,
                },
                ExtrinsicFailed: {
                  is: () => true,
                },
              },
            },
            rpc: {
              chain: {
                getBlockHash: () => 1,
                getBlock: () => ({
                  block: {
                    header: {
                      hash: "0x123",
                    },
                    extrinsics: [
                      {
                        hash: "0x123",
                      },
                    ],
                  },
                }),
              },
            },
            at: () => ({
              query: {
                system: {
                  events: () => [
                    {
                      phase: {
                        isApplyExtrinsic: true,
                        asApplyExtrinsic: {
                          eq: () => true,
                        },
                      },
                      event: {
                        // data: [dispatchError]
                        data: [
                          {
                            isModule: true,
                            asModule: {},
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            }),
          },
          selectedChain: selectedWASMChainMock,
        },
      } as any);

    const { findByTestId } = renderComponent();

    const activity = await findByTestId(testIds.activity);

    expect(activity.innerHTML).toEqual(JSON.stringify(activiyMock));
  });

  it("should load evm activity", async () => {
    const _Extension = (await import("@src/Extension")).default;
    _Extension.getActivity = vi.fn().mockReturnValue([
      {
        ...activiyMock[0],
        reference: "EVM",
      },
    ]);

    const providers = await import("@src/providers");
    providers.useNetworkContext = () =>
      ({
        state: {
          api: {
            getTransaction: () => ({
              wait: () => ({
                status: 1,
              }),
            }),
          },
          selectedChain: selectedEVMChainMock,
        },
      } as any);

    const { findByTestId } = renderComponent();

    const activity = await findByTestId(testIds.activity);

    expect(activity.innerHTML).toEqual(
      JSON.stringify([
        {
          ...activiyMock[0],
          reference: "EVM",
        },
      ])
    );
  });

  describe("reducer", () => {
    it("should initialize activity", () => {
      const state = reducer(initialState, {
        type: "init-activity",
        payload: {
          activity: activiyMock as Record[],
        },
      });

      expect(state.activity).toEqual(activiyMock);
    });

    it("should update activity status", () => {
      const state = reducer(
        {
          activity: activiyMock as Record[],
        },
        {
          type: "update-activity-status",
          payload: {
            hash: "0x123",
            status: RecordStatus.SUCCESS,
            error: undefined,
          },
        }
      );

      expect(state.activity[0].status).toEqual(RecordStatus.SUCCESS);
    });
  });
});
