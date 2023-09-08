import AccountEntity from "@src/storage/entities/Account";
import { Chain } from "@src/storage/entities/Chains";
import { API } from "@src/types";
export interface Asset {
  symbol: string;
  decimals: number;
  id: string;
  balance: BN;
  transferable: BN;
  reserved: BN;
  frozen: BN;
  address?: string;
  amount?: number;
  name?: string;
  price?: number;
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

export interface InitialState {
  network: string;
  assets: Asset[];
  isLoadingAssets: boolean;
}

export interface LoadAssetParams {
  api: API;
  selectedAccount: AccountEntity;
  selectedChain: Chain;
}

export interface AssetContext {
  state: InitialState;
  loadAssets: (props: LoadAssetParams) => void;
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
        network: string;
        assets: Asset[];
      };
    }
  | {
      type: "update-assets";
      payload: {
        network: string;
        assets: Assset[];
      };
    }
  | {
      type: "update-one-asset";
      payload: {
        asset: {
          updatedBy: "id" | "address" | "name";
          updatedByValue: string;
          balance: BN;
          transferable?: BN;
          reserved?: BN;
          frozen?: BN;
        };
      };
    };
