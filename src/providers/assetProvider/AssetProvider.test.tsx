/* eslint-disable @typescript-eslint/ban-types */
import { BN } from "bn.js";
import React from "react";
import {
  AssetProvider,
  initialState,
  reducer,
  useAssetContext,
} from "./AssetProvider";
import { selectedWASMChainMock } from "@src/tests/mocks/chain-mocks";
import { AccountType } from "@src/accounts/types";
import { stringToU8a } from "@polkadot/util";
import { render, waitFor } from "@testing-library/react";
import { BN0 } from "@src/constants/assets";
import { NetworkProvider, useNetworkContext } from "@src/providers/networkProvider";
import { AccountProvider, useAccountContext } from "@src/providers/accountProvider";

const testIds = {
  loadAssetsBtn: "load-assets-btn",
  assets: "assets",
};

const TestComponent = () => {
  const {
    state: { assets },
    loadAssets,
  } = useAssetContext();

  const { state: { api, selectedChain } } = useNetworkContext()
  const { state: { selectedAccount } } = useAccountContext()

  return (
    <>
      <button data-testid={testIds.loadAssetsBtn} onClick={() => loadAssets({
        api,
        selectedChain,
        selectedAccount
      })}>
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
    vi.mock("react", async () => {
      const react = (await vi.importActual("react")) as typeof React;
      return {
        ...react,
        useReducer: vi.fn().mockImplementation(() => {
          return [
            {
              assets: [
                {
                  id: "-1",
                  name: "DOT",
                  symbol: "DOT",
                  decimals: 10,
                  balance: 100,
                },
              ],
            },
            vi.fn(),
          ];
        }),
      };
    });

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
      }
    }))


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
      useNetworkContext: () => ({
        state: {
          selectedChain: selectedWASMChainMock,
          rpc: "wss://rpc.testnet.near.org",
          type: AccountType.WASM,
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
                metadata: {
                  entries: () => [
                    [
                      {
                        args: [1], // id = 1
                      },
                      {
                        name: stringToU8a("Asset 1"),
                        symbol: stringToU8a("USD"),
                        decimals: 2,
                      },
                    ],
                  ],
                },
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
      }),


      NetworkProvider: ({ children }: { children: React.ReactNode }) => {
        return <>{children}</>;
      }

    }));

    vi.mock("@src/providers/accountProvider", () => ({
      useAccountContext: () => ({
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
      }),
      AccountProvider: ({ children }: { children: React.ReactNode }) => {
        return <>{children}</>;
      }
    }))

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
    it("should load assests", async () => {
      const { getByTestId } = renderComponent();

      await waitFor(() => {
        const assets = getByTestId(testIds.assets);
        expect(assets.innerHTML).contain("DOT");
      });
    });
  });
});
