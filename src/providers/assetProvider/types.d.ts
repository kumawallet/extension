import { AssetBalance } from "@src/storage/entities/AssetBalance";

export interface InitialState {
  assets: AssetBalance;
  isLoadingAssets: boolean;
}

export interface AssetContext {
  state: InitialState;
}

export type Action =
  // | {
  //     type: "end-loading";
  //   }
  {
    type: "set-assets";
    payload: {
      assets: AssetBalance;
    };
  };
