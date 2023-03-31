import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer,
  useState,
  useCallback,
} from "react";
import { useAccountContext, useNetworkContext } from "@src/providers";
import {
  formatAmountWithDecimals,
  getAssetUSDPrice,
  getNatitveAssetBalance,
} from "@src/utils/assets";
import { ApiPromise } from "@polkadot/api";
import { ethers } from "ethers";
import AccountEntity from "@src/storage/entities/Account";
import { BN, hexToBn, u8aToString } from "@polkadot/util";
import Extension from "@src/Extension";
import erc20Abi from "@src/constants/erc20.abi.json";
import { ContractPromise } from "@polkadot/api-contract";
import metadata from "@src/constants/metadata.json";
import { PROOF_SIZE, REF_TIME } from "@src/constants/assets";
import { Action, Asset, AssetContext, InitialState } from "./types";
import randomcolor from "randomcolor";

const initialState: InitialState = {
  assets: [],
  isLoadingAssets: false,
};

const AssetContext = createContext({} as AssetContext);

export const reducer = (state: InitialState, action: Action) => {
  switch (action.type) {
    case "loading-assets": {
      return {
        ...state,
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
      const { assets } = action.payload;

      return {
        ...state,
        assets,
        isLoadingAssets: false,
      };
    }
    case "update-assets": {
      const { assets } = action.payload;
      return {
        ...state,
        assets,
      };
    }
    case "update-one-asset": {
      const {
        asset: { newValue, updatedBy, updatedByValue },
      } = action.payload;
      const assets = [...state.assets];

      const index = assets.findIndex(
        (asset) => asset[updatedBy] === updatedByValue
      );
      if (index > -1 && !newValue.eq(assets[index].balance)) {
        assets[index].balance = newValue;
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
  const [state, dispatch] = useReducer(reducer, initialState);
  const [unsubscribers, setUnsubscribers] = useState([]);

  const {
    state: { api, selectedChain, rpc, type },
  } = useNetworkContext();

  const {
    state: { selectedAccount },
  } = useAccountContext();

  const loadAssets = async () => {
    dispatch({
      type: "loading-assets",
    });
    let assets: Asset[] = [];
    try {
      const _nativeBalance = await getNativeAsset(api, selectedAccount);
      const _assets = await getOtherAssets();

      assets = [
        {
          id: "-1",
          ...selectedChain?.nativeCurrency,
          balance: _nativeBalance,
        },
        ..._assets.map((asset) => ({
          ...asset,
          // TODO: save this colors in storage
          color: randomcolor(),
        })),
      ];

      dispatch({
        type: "set-assets",
        payload: {
          assets,
        },
      });
    } catch (error) {
      console.log("error", error);
      dispatch({
        type: "end-loading",
      });
    } finally {
      getAssetsUSDPrice(assets);
    }
  };

  const getNativeAsset = async (
    api: ApiPromise | ethers.providers.JsonRpcProvider | null,
    account: AccountEntity
  ) => {
    const nativeAsset = await getNatitveAssetBalance(
      api,
      account.value.address
    );
    if (type === "WASM") {
      const unsub = await (api as ApiPromise).query.system.account(
        selectedAccount.value.address,
        ({ data, nonce }) => {
          dispatch({
            type: "update-one-asset",
            payload: {
              asset: {
                updatedBy: "id",
                updatedByValue: "-1",
                newValue: new BN(data?.free || 0),
              },
            },
          });
        }
      );
      // susbcribrer addde
      setUnsubscribers((state) => [...state, unsub]);
    } else {
      const _api = api as ethers.providers.JsonRpcProvider;
      _api.on("block", () => {
        _api.getBalance(account.value.address).then((balance) => {
          dispatch({
            type: "update-one-asset",
            payload: {
              asset: {
                updatedBy: "id",
                updatedByValue: "-1",
                newValue: balance,
              },
            },
          });
        });
      });
    }
    return nativeAsset;
  };

  const getOtherAssets = useCallback(async () => {
    if (!type) return [];

    if (type === "WASM") {
      const [assets, assetsFromPallet] = await Promise.all([
        loadAssetsFromStorage(),
        loadPolkadotAssets(),
      ]);

      assets.length > 0 && listoToWasmContracts(assets);

      return [...assetsFromPallet, ...assets];
    } else {
      const assets = loadAssetsFromStorage();
      return assets;
    }
  }, [type, api, selectedAccount]);

  const loadPolkadotAssets = useCallback(async () => {
    const assetPallet = await (api as ApiPromise)?.query?.assets;

    if (assetPallet?.metadata) {
      const assetsFromPallet = await assetPallet.metadata.entries();

      const formatedAssets: Asset[] = assetsFromPallet.map(
        ([
          {
            args: [id],
          },
          asset,
        ]) => {
          const _asset = asset as Partial<{
            name: Uint8Array;
            symbol: Uint8Array;
            decimals: Uint8Array;
          }>;

          return {
            id: String(id),
            name: u8aToString(_asset?.name),
            symbol: u8aToString(_asset?.symbol),
            decimals: Number(_asset?.decimals),
            balance: new BN("0"),
          };
        }
      );

      await Promise.all(
        formatedAssets.map((r, index) =>
          assetPallet
            ?.account(r.id, selectedAccount.value.address)
            .then(async (asset) => {
              const result = asset.toJSON() as Partial<{ balance: Uint8Array }>;

              let _balance = new BN("0");

              if (result?.balance) {
                if (typeof result?.balance === "number") {
                  _balance = new BN(String(result?.balance));
                }

                if (
                  typeof result.balance === "string" &&
                  (result.balance as string).startsWith("0x")
                ) {
                  _balance = hexToBn(result.balance);
                }
              }

              formatedAssets[index].balance = _balance;

              const unsub = await assetPallet?.account(
                r.id,
                selectedAccount.value.address,
                (data) => {
                  const result = data.toJSON() as Partial<{
                    balance: Uint8Array;
                  }>;

                  let _balance = new BN("0");

                  if (result?.balance) {
                    if (typeof result?.balance === "number") {
                      _balance = new BN(String(result?.balance));
                    }

                    if (
                      typeof result.balance === "string" &&
                      (result.balance as string).startsWith("0x")
                    ) {
                      _balance = hexToBn(result.balance);
                    }
                  }

                  dispatch({
                    type: "update-one-asset",
                    payload: {
                      asset: {
                        updatedBy: "id",
                        updatedByValue: r.id,
                        newValue: _balance,
                      },
                    },
                  });
                }
              );
              // susbcribrer added
              setUnsubscribers((state) => [...state, unsub]);
            })
        )
      );

      return formatedAssets;
    }

    return [];
  }, [api]);

  const loadAssetsFromStorage = async () => {
    const assetsFromStorage = await Extension.getAssetsByChain(
      selectedChain.name
    );
    const assets: Asset[] = [];

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
            if (type === "EVM") {
              const contract = new ethers.Contract(
                asset.address,
                erc20Abi,
                api
              );
              const balance = await contract.balanceOf(accountAddress);
              assets[index].balance = balance;
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
                        newValue: balance,
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
            console.log(error);
            assets[index].balance = new BN("0");
          }
        })
      );
    }

    return assets;
  };

  useEffect(() => {
    dispatch({
      type: "loading-assets",
    });
    removeListeners();
  }, [rpc, api]);

  const removeListeners = () => {
    if (unsubscribers.length > 0) {
      for (const unsub of unsubscribers) {
        unsub?.();
      }
      setUnsubscribers([]);
    }
  };

  useEffect(() => {
    removeListeners();
  }, [selectedAccount?.key]);

  useEffect(() => {
    if (
      rpc &&
      selectedAccount?.value?.address &&
      selectedChain &&
      type &&
      api
    ) {
      if (selectedAccount?.type?.includes(type)) {
        loadAssets();
      }
    }
  }, [rpc, selectedAccount, type, api]);

  const getAssetsUSDPrice = async (assets?: Asset[]) => {
    try {
      const copyAssets = [...(assets || state.assets)];

      const addresToQuery = [];
      for (const [index, asset] of copyAssets.entries()) {
        if (asset.id === "-1" && asset.name && !asset.balance.isZero?.()) {
          addresToQuery.push({
            index,
            asset,
          });
        }
      }

      await Promise.all(
        addresToQuery.map(async ({ asset, index }) => {
          if (asset.id === "-1") {
            const price = await getAssetUSDPrice(asset.name as string);

            const _balance = Number(
              formatAmountWithDecimals(Number(asset.balance), 6, asset.decimals)
            );

            copyAssets[index].amount = price * _balance;
          }
          return;
        })
      );

      dispatch({
        type: "update-assets",
        payload: {
          assets: copyAssets,
        },
      });
    } catch (error) {
      console.log("error", error);
      //
    }
  };

  const listoToWasmContracts = async (assets: Asset[]) => {
    const unsub = await (api as ApiPromise).rpc.chain.subscribeNewHeads(
      async () => {
        const gasLimit = api.registry.createType("WeightV2", {
          refTime: REF_TIME,
          proofSize: PROOF_SIZE,
        });

        for (const asset of assets) {
          const { output } = await asset.contract.query.balanceOf(
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
                newValue: balance,
              },
            },
          });
        }
      }
    );

    setUnsubscribers((state) => [...state, unsub]);
  };

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
