export interface Asset {
  symbol: string;
  decimals: number;
  id: string;
  balance: BN | ethers.BigNumberish;
  address?: string;
  amount?: number;
  name?: string;
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
    };
