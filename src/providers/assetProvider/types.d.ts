import AccountEntity from "@src/storage/entities/Account";
import { API } from "@src/types";

export interface Asset {
  symbol: string;
  decimals: number;
  id: string;
  balance: BN;
  transferable?: BN;
  reserved?: BN;
  frozen?: BN;
  address?: string;
  amount?: number;
  name?: string;
  price?: number;
  color?: string;
  aditionalData?:
    | {
        tokenId: {
          Token: string;
        };
      }
    | {
        tokenId: { ForeignAsset: string };
      }
    | {
        tokenId: { StableAssetPoolToken: string };
      }
    | null;
}
type assets = {
  [id: string] : Asset[];
}
export interface InitialState {
  assets: assets;
  isLoadingAssets: boolean;
}

type SelectedChain = {
  [id: string]: chain
}
type chain = {
  isTestnet?: boolean;
  type: "wasm" | "evm" | "ol";
}

export interface LoadAssetParams {
  api: API;
  selectedAccount: AccountEntity;
  selectedChain: SelectedChain;
}

export interface AssetContext {
  state: InitialState;
  // loadAssets: (props: LoadAssetParams) => void;
}

export type Action =
  | {
      type: "loading-assets";
    }
  | {
      type: "end-loading";
    }
  | {
      type: "set-assets";
      payload: {
        assets: assets;
      };
    }
  // | {
  //     type: "update-assets";
  //     payload: {
  //       assets: assets;
  //     };
  //   }
  // | {
  //     type: "update-one-asset";
  //     payload: {
  //       asset: {
  //         updatedBy: "id" | "address" | "name";
  //         updatedByValue: string;
  //         balance: BN;
  //         transferable?: BN;
  //         reserved?: BN;
  //         frozen?: BN;
  //       };
  //       networkId: string
  //     };
  // //   }
  //   | {
  //     type: "update-one-network-assets";
  //     payload: {
  //       network: string;
  //       assets: Asset[];
  //     };

