import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { useAccountContext, useNetworkContext } from "@src/providers";
import {
  formatAmountWithDecimals,
  getAssetUSDPrice,
  getNatitveAssetBalance,
  getSubtrateNativeBalance,
  getWasmAssets,
} from "@src/utils/assets";
import { ApiPromise } from "@polkadot/api";
import { Contract, ethers } from "ethers";
import AccountEntity from "@src/storage/entities/Account";
import { BN } from "@polkadot/util";
import erc20Abi from "@src/constants/erc20.abi.json";
import { ContractPromise } from "@polkadot/api-contract";
import metadata from "@src/constants/metadata.json";
import {
  BN0,
  COINGECKO_ASSET_MAP,
  PROOF_SIZE,
  REF_TIME,
} from "@src/constants/assets";
import { Action, Asset, AssetContext, InitialState, LoadAssetParams, SelectedChain } from "./types";
import randomcolor from "randomcolor";
import { API, Chain, IAsset } from "@src/types";
import { captureError } from "@src/utils/error-handling";
import { messageAPI } from "@src/messageAPI/api";

export const initialState: InitialState = {
  network: "",
  assets: [],
  isLoadingAssets: false,
};

const AssetContext = createContext({} as AssetContext);

export const reducer = (state: InitialState, action: Action) => {
  switch (action.type) {
    case "loading-assets": {
      return {
        ...state,
        network: "",
        assets: [],
        isLoadingAssets: true,
      };
    }
    case "end-loading": {
      return {
        ...state,
        isLoadingAssets: false,
      };
    }
    case "set-assets": {
      const { assets, network } = action.payload;

      if (state.network !== "") return {
        ...state,
        isLoadingAssets: false,
      };

      return {
        ...state,
        network,
        assets,
        isLoadingAssets: false,
      };
    }
    case "update-assets": {
      const { assets, network } = action.payload;

      if (network !== state.network) return state

      return {
        ...state,
        assets,
      };
    }
    case "update-one-asset": {
      const {
        asset: {
          balance = BN0,
          frozen = BN0,
          reserved = BN0,
          transferable = BN0,
          updatedBy,
          updatedByValue,
        },
      } = action.payload;
      const assets = [...state.assets];

      const index = assets.findIndex(
        (asset) => asset[updatedBy] === updatedByValue
      );
      if (index > -1 && !balance?.eq(assets[index].balance)) {
        const _balance = Number(
          formatAmountWithDecimals(Number(balance), 6, assets[index]?.decimals)
        );

        assets[index] = {
          ...assets[index],
          amount: Number(((assets[index].price || 0) * _balance).toFixed(2)),
          balance,
          frozen,
          reserved,
          transferable,
        };
        return {
          ...state,
          assets,
        };
      }
      return {
        ...state,
      };
    }
    default:
      return state;
  }
};

export const AssetProvider: FC<PropsWithChildren> = ({ children }) => {
  const {
    state: { api, selectedChain },
  } = useNetworkContext();

  const {
    state: { selectedAccount },
  } = useAccountContext();

  const [state, dispatch] = useReducer(reducer, initialState);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [unsubscribers, setUnsubscribers] = useState<any[]>([]);

  const loadAssets = async ({
    api,
    selectedAccount,
    selectedChain,
  }: LoadAssetParams) => {
    if (!api || !selectedChain) return

    dispatch({
      type: "loading-assets",
    });

    if (!selectedAccount?.type?.toLowerCase()?.includes(selectedChain.type)) {
      dispatch({
        type: "set-assets",
        payload: {
          assets: [],
          network: selectedChain.name,
        }
      })

      dispatch({
        type: "end-loading",
      });
      return;
    }

    let assets: Asset[] = [];
    try {
      const _nativeBalance = await getNativeAsset(api, selectedAccount, selectedChain);
      const _assets = await getOtherAssets({
        api,
        selectedAccount,
        selectedChain,
      });

      assets = [
        {
          id: "-1",
          symbol: selectedChain.symbol,
          decimals: selectedChain.decimals,
          ..._nativeBalance,
        },
        ..._assets.map((asset) => ({
          ...asset,
          // TODO: save this colors in storage
          color: randomcolor(),
        })) as Asset[],
      ];
      dispatch({
        type: "set-assets",
        payload: {
          network: selectedChain?.name,
          assets,
        },
      });
    } catch (error) {
      captureError(error);
      dispatch({
        type: "end-loading",
      });
    } finally {
      if (!selectedChain.isTestnet && !selectedChain.isCustom)
        getAssetsUSDPrice(assets, selectedChain?.name);
    }
    return assets;
  };

  const getNativeAsset = async (
    api: API,
    account: AccountEntity,
    selectedChain: SelectedChain
  ) => {
    const address = account.value.address;

    const amounts = await getNatitveAssetBalance(api, address);

    // suscribers for native asset balance update
    if (selectedChain.type === "wasm") {
      const unsub = await (api as ApiPromise).query.system.account(
        address,
        ({
          data,
        }: {
          data: {
            free: string;
            reserved: string;
            miscFrozen?: string;
            frozen?: string;
            feeFrozen?: string;
          };
        }) => {
          const { transferable, reserved, balance, frozen } =
            getSubtrateNativeBalance(data);

          dispatch({
            type: "update-one-asset",
            payload: {
              asset: {
                updatedBy: "id",
                updatedByValue: "-1",
                balance,
                transferable,
                reserved,
                frozen,
              },
            },
          });
        }
      );
      // susbcribrer addde
      setUnsubscribers((state) => [...state, unsub]);
    } else {
      const _api = api as ethers.providers.JsonRpcProvider;
      _api.off("block");

      _api.on("block", () => {
        _api.getBalance(account.value.address).then((balance) => {
          dispatch({
            type: "update-one-asset",
            payload: {
              asset: {
                updatedBy: "id",
                updatedByValue: "-1",
                balance,
              },
            },
          });
        });
      });
    }

    return amounts;
  };

  const getOtherAssets = async ({ api, selectedAccount, selectedChain }: LoadAssetParams) => {

    if (selectedChain!.type === "wasm") {
      const [assets, assetsFromPallet] = await Promise.all([
        loadAssetsFromStorage(selectedChain!),
        loadPolkadotAssets({
          api,
          selectedAccount,
          selectedChain,
        }),
      ]);

      assets.length > 0 && listWasmContracts(assets);

      return [...assetsFromPallet, ...assets];
    } else {
      const assets = await loadAssetsFromStorage(selectedChain!);
      return assets;
    }
  };

  const loadPolkadotAssets = async ({ api, selectedAccount, selectedChain }: LoadAssetParams) => {
    const { assets, unsubs } = await getWasmAssets(
      api,
      selectedChain!.id,
      selectedAccount?.value?.address,
      (
        assetId: string,
        amounts: {
          balance: BN;
          frozen: BN;
          reserved: BN;
          transferable: BN;
        }
      ) => {
        dispatch({
          type: "update-one-asset",
          payload: {
            asset: {
              updatedBy: "id",
              updatedByValue: assetId,
              balance: amounts.balance,
              frozen: amounts.frozen,
              reserved: amounts.reserved,
              transferable: amounts.transferable,
            },
          },
        });
      }
    );

    unsubs &&
      unsubs?.length > 0 &&
      setUnsubscribers((state) => [...state, ...unsubs]);

    return assets || [];
  };

  const loadAssetsFromStorage = async (chain: Chain) => {
    try {
      const assetsFromStorage = await messageAPI.getAssetsByChain(
        {
          chain: chain.id
        }
      );
      const assets: IAsset[] = [];

      if (assetsFromStorage.length > 0 && selectedAccount?.value?.address) {
        const accountAddress = selectedAccount.value.address;

        await Promise.all(
          assetsFromStorage.map(async (asset, index) => {
            assets[index] = {
              address: asset.address,
              balance: "",
              id: String(index),
              decimals: asset.decimals,
              symbol: asset.symbol,
            };

            try {
              if (chain.type === "evm") {
                const contract = new Contract(
                  asset.address,
                  erc20Abi,
                  api
                );


                const balance = await contract.balanceOf(accountAddress);


                assets[index].balance = balance;

                contract.removeAllListeners("Transfer");

                contract.on("Transfer", async (from, to) => {
                  const selfAddress = selectedAccount?.value?.address;
                  if (from === selfAddress || to === selfAddress) {
                    const balance = await contract.balanceOf(accountAddress);
                    dispatch({
                      type: "update-one-asset",
                      payload: {
                        asset: {
                          updatedBy: "id",
                          updatedByValue: assets[index].id,
                          balance,
                        },
                      },
                    });
                  }
                });
              } else {
                const gasLimit = api.registry.createType("WeightV2", {
                  refTime: REF_TIME,
                  proofSize: PROOF_SIZE,
                });

                const contract = new ContractPromise(
                  api,
                  metadata,
                  asset.address
                );

                const { output } = await contract.query.balanceOf(
                  accountAddress,
                  {
                    gasLimit,
                  },
                  accountAddress
                );
                assets[index].balance = new BN(output?.toString() || "0");
                assets[index].contract = contract;
              }
            } catch (error) {
              captureError(error);
              assets[index].balance = new BN("0");
            }
          })
        );
      }

      return assets;
    } catch (error) {
      return [];
    }
  };

  const removeListeners = () => {
    if (unsubscribers.length > 0) {
      for (const unsub of unsubscribers) {
        unsub?.();
      }
      setUnsubscribers([]);
    }
  };

  const getAssetsUSDPrice = async (assets: Asset[], network: string) => {
    try {
      const copyAssets = [...assets];

      const addresToQuery = [];
      for (const [index, asset] of copyAssets.entries()) {
        if (asset.symbol) {
          addresToQuery.push({
            index,
            asset,
          });
        }
      }

      await Promise.all(
        addresToQuery.map(async ({ asset, index }) => {
          const query = asset.symbol;

          const network = COINGECKO_ASSET_MAP[query?.toLowerCase()] || query;

          const price = await getAssetUSDPrice(network).catch(() => 0);

          const _balance = Number(
            formatAmountWithDecimals(Number(asset.balance), 6, asset?.decimals)
          );

          copyAssets[index].price = price;
          copyAssets[index].amount = Number((price * _balance).toFixed(2));

          return;
        })
      );

      dispatch({
        type: "update-assets",
        payload: {
          network,
          assets: copyAssets,
        },
      });
    } catch (error) {
      captureError(error);
    }
  };

  const listWasmContracts = async (assets: IAsset[]) => {
    const unsub = await (api as ApiPromise).rpc.chain.subscribeNewHeads(
      async () => {
        const gasLimit = api.registry.createType("WeightV2", {
          refTime: REF_TIME,
          proofSize: PROOF_SIZE,
        });

        for (const asset of assets) {
          const { output } = await (
            asset.contract as ContractPromise
          ).query.balanceOf(
            selectedAccount?.value?.address,
            {
              gasLimit,
            },
            selectedAccount.value?.address
          );
          const balance = new BN(output?.toString() || "0");

          dispatch({
            type: "update-one-asset",
            payload: {
              asset: {
                updatedBy: "address",
                updatedByValue: asset.address as string,
                balance,
              },
            },
          });
        }
      }
    );

    setUnsubscribers((state) => [...state, unsub]);
  };

  useEffect(() => {
    dispatch({
      type: "loading-assets",
    });
    removeListeners();
  }, [api]);

  useEffect(() => {
    removeListeners();
  }, [selectedAccount?.key]);

  useEffect(() => {
    if (
      selectedAccount &&
      api &&
      selectedChain
    ) {

      loadAssets({
        api,
        selectedAccount,
        selectedChain
      });
    }
  }, [selectedChain, selectedAccount, api]);


  return (
    <AssetContext.Provider
      value={{
        state,
        loadAssets,
      }}
    >
      {children}
    </AssetContext.Provider>
  );
};

export const useAssetContext = () => useContext(AssetContext);
