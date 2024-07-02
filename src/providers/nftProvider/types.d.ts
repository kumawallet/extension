import { NFT_Address } from "@src/types";




export interface InitialState {
  nfts: NFT_Address;
}

export interface NFTContext {
  state: InitialState;
}

export type Action =
  {
      type: "update-nfts";
      payload: {
        nfts: nfts;
      };
    };
