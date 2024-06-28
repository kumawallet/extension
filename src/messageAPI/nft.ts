import {
    RequestGetCollection
  } from "@src/entries/background/handlers/request-types";
import { sendMessage } from ".";
import { nftContract} from "@src/types"
  
  export const nftMessages = {
    getCollection: (params: RequestGetCollection) => {
      return sendMessage("pri(nft.getCollection)", params);
    },
    nftsSubscribe: (cb: (nfts: nftContract[] ) => void) => {
        return sendMessage("pri(nft.subscription)", null, cb);
      },
  };
  