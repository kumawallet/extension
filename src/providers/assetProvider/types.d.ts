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
  assets: Asset[];
  isLoadingAssets: boolean;
}

export interface AssetContext {
  state: InitialState;
  loadAssets: () => void;
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
        assets: Asset[];
      };
    }
  | {
      type: "update-assets";
      payload: {
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
