import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react";
import { useAccountContext } from "../accountProvider";
import { useNetworkContext } from "../networkProvider";
import { useEffect } from "react";
import { getNatitveAssetBalance } from "@src/utils/assets";
import { ApiPromise } from "@polkadot/api";
import { ethers } from "ethers";
import AccountEntity from "@src/storage/entities/Account";
import { Chain } from "../../storage/entities/Chains";
import { BN, hexToBn, u8aToString } from "@polkadot/util";
import Extension from "@src/Extension";
import erc20Abi from "@src/constants/erc20.abi.json";
import { ContractPromise } from "@polkadot/api-contract";
import metadata from "@src/constants/metadata.json";

interface InitialState {
  assets: Asset[];
  isLoadingAssets: boolean;
}

const initialState: InitialState = {
  assets: [],
  isLoadingAssets: false,
};

interface AssetContext {
  state: InitialState;
  loadAssets: () => void;
}

const AssetContext = createContext({} as AssetContext);

export interface Asset {
  name: string;
  symbol: string;
  decimals: string;
  id: string;
  balance: number;
}

const reducer = (state: InitialState, action: any) => {
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

  const loadAssets = async () => {
    dispatch({
      type: "loading-assets",
    });
    try {
      const _nativeBalance = await getNativeAsset(
        api,
        selectedAccount,
        selectedChain
      );
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
    } catch (error) {
      dispatch({
        type: "end-loading",
      });
    }
  };

  const getNativeAsset = async (
    api: ApiPromise | ethers.providers.JsonRpcProvider | null,
    account: AccountEntity,
    chain: Chain
  ) => {
    const nativeAsset = await getNatitveAssetBalance(
      api,
      account.value.address,
      chain?.nativeCurrency.decimals || 1
    );
    return nativeAsset;
  };

  const getOtherAssets = async () => {
    if (!type) return [];

    if (type === "WASM") {
      const assets = await loadPolkadotAssets();
      return assets;
    } else {
      const assets = await loadEvmAssets();
      return assets;
    }
  };

  const loadPolkadotAssets = async () => {
    let assets: any[] = [];

    const _assetsFromStorage = await Extension.getAssetsByChain(
      selectedChain.name
    );

    const refTime = new BN("1000000000000");
    const proofSize = new BN("1000000000000");

    await Promise.all(
      _assetsFromStorage.map(async (asset, index) => {
        try {
          const contract = new ContractPromise(api, metadata, asset.address);
          const { output } = await contract.query.balanceOf(
            selectedAccount.value.address,
            {
              gasLimit: api.registry.createType("WeightV2", {
                refTime,
                proofSize,
              }),
            },
            selectedAccount.value.address
          );
          _assetsFromStorage[index].balance = new BN(output?.toString());
          _assetsFromStorage[index].id = index;
        } catch (error) {
          _assetsFromStorage[index].balance = 0;
          _assetsFromStorage[index].id = index;
        }
      })
    );

    assets = [...assets, ..._assetsFromStorage];

    const assetPallet: any = await (api as ApiPromise)?.query?.assets;

    if (assetPallet) {
      const assetsFromPallet: any = await (
        assetPallet?.metadata as any
      ).entries();

      const formatedAssets = assetsFromPallet.map(
        ([
          {
            args: [id],
          },
          asset,
        ]: any) => {
          return {
            id: String(id),
            name: u8aToString(asset?.name),
            symbol: u8aToString(asset?.symbol),
            decimals: Number(asset?.decimals),
          };
        }
      );

      await Promise.all(
        formatedAssets.map((r: any, index: number) =>
          assetPallet
            ?.account(r.id, selectedAccount.value.address)
            .then((r) => {
              const result = r?.toJSON?.();
              formatedAssets[index].balance = result?.balance
                ? new BN(String(result?.balance))
                : new BN("0");
            })
        )
      );

      assets = [...assets, ...formatedAssets];
    }

    return assets;
  };

  const loadEvmAssets = async () => {
    const assets = await Extension.getAssetsByChain(selectedChain.name);

    if (assets.length > 0) {
      await Promise.all(
        assets.map(async (asset, index) => {
          try {
            const contract = new ethers.Contract(asset?.address, erc20Abi, api);
            const balance = await contract.balanceOf(
              selectedAccount.value.address
            );
            const _balance = Number(balance) / 10 ** Number(asset?.decimals);
            assets[index].balance = _balance;
            assets[index].id = index;
          } catch (error) {
            assets[index].balance = 0;
            assets[index].id = index;
          }
        })
      );
    }

    return assets;
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
