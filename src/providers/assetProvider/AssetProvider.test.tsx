/* eslint-disable @typescript-eslint/ban-types */
import { BN } from "bn.js";
import React from "react";
import {
  AssetProvider,
  initialState,
  reducer,
  useAssetContext,
} from "./AssetProvider";
import { render, waitFor } from "@testing-library/react";
import { BN0 } from "@src/constants/assets";
import {
  NetworkProvider,
  useNetworkContext,
} from "@src/providers/networkProvider";
import {
  AccountProvider,
  useAccountContext,
} from "@src/providers/accountProvider";
import { EVM_CHAINS, SUBTRATE_CHAINS } from "@src/constants/chainsData";
import { BigNumber } from "ethers";

const networkProviderMock = vi.hoisted(() => ({
  useNetworkContext: vi.fn(),
}));

const accountProviderMock = vi.hoisted(() => ({
  useAccountContext: vi.fn()
}))

const testIds = {
  loadAssetsBtn: "load-assets-btn",
  assets: "assets",
};

const TestComponent = () => {
  const {
    state: { assets },
    loadAssets,
  } = useAssetContext();

  const {
    state: { api, selectedChain },
  } = useNetworkContext();
  const {
    state: { selectedAccount },
  } = useAccountContext();

  return (
    <>
      <button
        data-testid={testIds.loadAssetsBtn}
        onClick={() =>
          loadAssets({
            api,
            selectedChain,
            selectedAccount,
          })
        }
      >
        load assets
      </button>
      <div data-testid={testIds.assets}>{JSON.stringify(assets)}</div>
    </>
  );
};

const renderComponent = () => {
  return render(
    <NetworkProvider>
      <AccountProvider>
        <AssetProvider>
          <TestComponent />
        </AssetProvider>
      </AccountProvider>
    </NetworkProvider>
  );
};

describe("AssetProvider", () => {
  beforeAll(() => {
    // mock useReducer


    vi.mock("@src/messageAPI/api", async () => ({
      messageAPI: {
        getAssetsByChain: vi.fn().mockReturnValue([
          {
            id: "1",
            name: "Asset 1",
            symbol: "USD",
            decimals: 2,
            address: "0x123",
          },
        ]),
      },
    }));

    vi.mock("@polkadot/api-contract", () => {
      class ContractPromise {
        constructor() {
          return {
            query: {
              balanceOf: () => {
                return {
                  output: "100",
                };
              },
            },
          };
        }
      }

      return {
        ContractPromise,
      };
    });

    vi.mock("@src/providers/networkProvider", () => ({
      useNetworkContext: networkProviderMock.useNetworkContext,
      NetworkProvider: ({ children }: { children: React.ReactNode }) => {
        return <>{children}</>;
      },
    }));

    vi.mock("@src/providers/accountProvider", () => ({
      useAccountContext: accountProviderMock.useAccountContext,
      AccountProvider: ({ children }: { children: React.ReactNode }) => {
        return <>{children}</>;
      },
    }));

    vi.mock("@src/utils/assets", async () => {
      const assetUtils = (await vi.importActual("@src/utils/assets")) as Record<
        string,
        string
      >;

      return {
        ...assetUtils,
        getAssetUSDPrice: vi.fn().mockReturnValue({
          catch: () => 0,
        }),
      };
    });

    vi.mock("ethers", async () => {
      const actual = await vi.importActual("ethers");
      return {
        ...actual,
        Contract: class {
          constructor() { }

          balanceOf() {
            return Promise.resolve(BigNumber.from("100"));
          }

          removeAllListeners() { }

          on(key: string, cb: () => {}) {
            cb();
          }
        },
      };
    });
  });

  describe("reducer", () => {
    it("should loading assets", () => {
      const state = reducer(initialState, {
        type: "loading-assets",
      });
      expect(state).toEqual({
        network: "",
        assets: [],
        isLoadingAssets: true,
      });
    });

    it("should end loading", () => {
      const state = reducer(initialState, {
        type: "end-loading",
      });
      expect(state).toEqual({
        network: "",
        assets: [],
        isLoadingAssets: false,
      });
    });

    it("should set assets", () => {
      const state = reducer(initialState, {
        type: "set-assets",
        payload: {
          network: "testnet",
          assets: [
            {
              id: "1",
              name: "Asset 1",
              balance: 100,
              symbol: "USD",
              decimals: 2,
              amount: 100,
              frozen: BN0,
              reserved: BN0,
              transferable: BN0,
            },
          ],
        },
      });
      expect(state).toEqual({
        network: "testnet",
        assets: [
          {
            id: "1",
            name: "Asset 1",
            balance: 100,
            symbol: "USD",
            decimals: 2,
            amount: 100,
            frozen: BN0,
            reserved: BN0,
            transferable: BN0,
          },
        ],
        isLoadingAssets: false,
      });
    });

    it("should update assets", () => {
      const state = reducer(
        {
          network: "testnet",

          assets: [
            {
              id: "1",
              name: "Asset 1",
              balance: 100,
              symbol: "USD",
              decimals: 2,
              amount: 100,
              frozen: BN0,
              reserved: BN0,
              transferable: BN0,
            },
          ],
          isLoadingAssets: false,
        },
        {
          type: "update-assets",
          payload: {
            network: "testnet",
            assets: [
              {
                id: "1",
                name: "Asset 1",
                balance: 100,
                symbol: "USD",
                decimals: 2,
                amount: 200,
              },
            ],
          },
        }
      );
      expect(state).toEqual({
        network: "testnet",
        assets: [
          {
            id: "1",
            name: "Asset 1",
            balance: 100,
            symbol: "USD",
            decimals: 2,
            amount: 200,
          },
        ],
        isLoadingAssets: false,
      });
    });

    it("should update one assets", () => {
      const state = reducer(
        {
          network: "testnet",

          assets: [
            {
              id: "1",
              name: "Asset 1",
              balance: new BN("100"),
              symbol: "USD",
              decimals: 2,
              amount: 100,
              frozen: BN0,
              reserved: BN0,
              transferable: BN0,
            },
          ],
          isLoadingAssets: false,
        },
        {
          type: "update-one-asset",
          payload: {
            asset: {
              updatedBy: "id",
              updatedByValue: "1",
              balance: new BN("200"),
              frozen: BN0,
              reserved: BN0,
              transferable: BN0,
            },
          },
        }
      );
      expect(state).toEqual({
        network: "testnet",
        assets: [
          {
            id: "1",
            name: "Asset 1",
            balance: new BN("200"),
            frozen: BN0,
            reserved: BN0,
            transferable: BN0,
            symbol: "USD",
            decimals: 2,
            amount: 0,
          },
        ],
        isLoadingAssets: false,
      });
    });

    it("shoudn't update one assets", () => {
      const state = reducer(
        {
          network: "testnet",
          assets: [
            {
              id: "1",
              name: "Asset 1",
              balance: new BN("100"),
              symbol: "USD",
              decimals: 2,
              amount: 100,
              frozen: BN0,
              reserved: BN0,
              transferable: BN0,
            },
          ],
          isLoadingAssets: false,
        },
        {
          type: "update-one-asset",
          payload: {
            asset: {
              updatedBy: "id",
              updatedByValue: "2",
              balance: new BN("200"),
              frozen: BN0,
              reserved: BN0,
              transferable: BN0,
            },
          },
        }
      );
      expect(state).toEqual({
        network: "testnet",
        assets: [
          {
            id: "1",
            name: "Asset 1",
            balance: new BN("100"),
            symbol: "USD",
            decimals: 2,
            amount: 100,
            frozen: BN0,
            reserved: BN0,
            transferable: BN0,
          },
        ],
        isLoadingAssets: false,
      });
    });
  });

  describe("wasm assets", () => {
    beforeAll(() => {
      const astar = SUBTRATE_CHAINS[2];

      accountProviderMock.useAccountContext.mockReturnValue({
        state: {
          selectedAccount: {
            key: "WASM-5FFNZWjJxsaBJr3P2hsfSZnw9PxB8yCwQW6EWjyyrQW1QYyF",
            value: {
              name: "asd",
              keyring: "WASM-5FFNZWjJxsaBJr3P2hsfSZnw9PxB8yCwQW6EWjyyrQW1QYyF",
              address: "1",
            },
            type: "WASM",
          },
        },
      })

      networkProviderMock.useNetworkContext.mockReturnValue({
        state: {
          selectedChain: astar,
          api: {
            rpc: {
              chain: {
                subscribeNewHeads: (callback?: Function) => {
                  callback?.();
                },
              },
            },
            registry: {
              createType: () => "100_000_000_000",
            },
            query: {
              system: {
                account: (address: string, callback?: Function) => {
                  address;

                  const response = {
                    data: {
                      free: "100",
                      reserved: "100",
                      miscFrozen: "0",
                      frozen: "0",
                      feeFrozen: "0",
                    },
                  };

                  if (callback) {
                    callback(response);
                  } else {
                    return response;
                  }
                },
              },
              assets: {
                account: async (
                  assetId: number,
                  address: string,
                  callback?: Function
                ) => {
                  const response = {
                    toJSON: () => ({
                      balance: new BN(100),
                    }),
                  };

                  if (callback) {
                    callback(response);
                  } else {
                    return Promise.resolve(response);
                  }
                },
              },
            },
          },
        },
      });
    })

    it("should load assests", async () => {


      const { getByTestId } = renderComponent();

      await waitFor(() => {
        const assets = getByTestId(testIds.assets);
        expect(assets.innerHTML).contain("ASTR");
      });
    });
  });

  describe("evm assets", () => {
    beforeAll(() => {
      const ethereum = EVM_CHAINS[0];

      accountProviderMock.useAccountContext.mockReturnValue({
        state: {
          selectedAccount: {
            key: "evm-0xb6Fd52f0FD95aeD5dd46284AaD60a8ac5d86A627",
            value: {
              name: "asd",
              keyring: "evm-0xb6Fd52f0FD95aeD5dd46284AaD60a8ac5d86A627",
              address: "1",
            },
            type: "evm",
          },
        },
      })

      networkProviderMock.useNetworkContext.mockReturnValue({
        state: {
          selectedChain: ethereum,
          api: {
            getBalance: vi.fn().mockResolvedValue(BigNumber.from("100")),
            off: () => { },
            on: (key: string, cb: () => {}) => {
              cb();
            },
          },
        },
      });
    })

    it("should load assests", async () => {


      const { getByTestId } = renderComponent();

      await waitFor(() => {
        const assets = getByTestId(testIds.assets);
        expect(assets.innerHTML).contain("ETH");
      });
    });
  });
});
