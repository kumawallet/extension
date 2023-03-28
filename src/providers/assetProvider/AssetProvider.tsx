import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer,
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
import { BN, u8aToString } from "@polkadot/util";
import Extension from "@src/Extension";
import erc20Abi from "@src/constants/erc20.abi.json";
import { ContractPromise } from "@polkadot/api-contract";
import metadata from "@src/constants/metadata.json";
import { useCallback } from "react";
import { PROOF_SIZE, REF_TIME } from "@src/constants/assets";
import { Action, Asset, AssetContext, InitialState } from "./types";

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
    default:
      return state;
  }
};

export const AssetProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

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
    try {
      const _nativeBalance = await getNativeAsset(api, selectedAccount);
      const _assets = await getOtherAssets();

      const assets: Asset[] = [
        {
          id: "-1",
          ...selectedChain?.nativeCurrency,
          balance: _nativeBalance,
        },
        ..._assets,
      ];

      dispatch({
        type: "set-assets",
        payload: {
          assets,
        },
      });

      getAssetsUSDPrice(assets);
    } catch (error) {
      dispatch({
        type: "end-loading",
      });
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
    return nativeAsset;
  };

  const getOtherAssets = useCallback(async () => {
    if (!type) return [];

    if (type === "WASM") {
      const [assetsFromPallet, assets] = await Promise.all([
        loadAssetsFromStorage(),
        loadPolkadotAssets(),
      ]);
      return [...assetsFromPallet, ...assets];
    } else {
      const assets = loadAssetsFromStorage();
      return assets;
    }
  }, [type, api]);

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
            .then((asset) => {
              const result = asset.toJSON() as Partial<{ balance: Uint8Array }>;
              formatedAssets[index].balance =
                (result?.balance && new BN(String(result?.balance))) ||
                new BN("0");
            })
        )
      );

      return formatedAssets;
    }

    return [];
  }, [api]);

  const loadAssetsFromStorage = useCallback(async () => {
    const assetsFromStorage = await Extension.getAssetsByChain(
      selectedChain.name
    );
    const assets: Asset[] = [];

    if (assetsFromStorage.length > 0) {
      const accountAddress = selectedAccount.value.address;

      await Promise.all(
        assetsFromStorage.map(async (asset, index) => {
          assets[index] = {
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
              assets[index].balance = ethers.utils.formatUnits(balance, 18);
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
            }
          } catch (error) {
            assets[index].balance = new BN("0");
          }
        })
      );
    }

    return assets;
  }, [selectedAccount, api, selectedChain, type]);

  useEffect(() => {
    dispatch({
      type: "loading-assets",
    });
  }, [rpc, api]);

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
        if (asset.id === "-1" && asset.name && !asset.balance.isZero()) {
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
