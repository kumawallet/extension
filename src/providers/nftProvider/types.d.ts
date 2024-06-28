import { nftContract} from "@src/types";




export interface InitialState {
  nfts: nftContract[];
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
