import Record from "@src/storage/entities/activity/Record";
import { TxProvider, useTxContext } from "./TxProvider";
import { RecordStatus, RecordType } from "@src/storage/entities/activity/types";
import { selectedWASMAccountMock } from "@src/tests/mocks/account-mocks";
import {
  selectedEVMChainMock,
  selectedWASMChainMock,
} from "@src/tests/mocks/chain-mocks";
import { render, waitFor } from "@testing-library/react";

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

    vi.mock("@src/utils/env", () => ({
      getWebAPI: () => ({
        windows: {
          getCurrent: () => ({
            id: 1,
          }),
        },
        runtime: {
          sendMessage: () => null,
          connect: () => null,
          onMessage: {
            addListener: () => null,
            removeListener: () => null,
          },
        },
      }),
    }));

    vi.mock("@src/Extension");
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { findByTestId } = renderComponent();

    await waitFor(async () => {
      const activity = await findByTestId(testIds.activity);

      expect(activity.innerHTML).toEqual(JSON.stringify(activiyMock));
    }, {
      timeout: 10000
    });
  });

  it("should load evm activity", async () => {
    const _Extension = (await import("@src/Extension")).default;
    _Extension.getActivity = vi.fn().mockReturnValue([
      {
        ...activiyMock[0],
        reference: "EVM",
        status: RecordStatus.PENDING,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { findByTestId } = renderComponent();

    await waitFor(async () => {
      const activity = await findByTestId(testIds.activity);

      expect(activity.innerHTML).toEqual(
        JSON.stringify([
          {
            ...activiyMock[0],
            reference: "EVM",
            status: RecordStatus.SUCCESS,
            error: "",
          },
        ])
      );
    });
  });
});
