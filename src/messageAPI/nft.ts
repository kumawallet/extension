import {
    RequestGetCollection,
    RequestContractAddressValidate
  } from "@src/entries/background/handlers/request-types";
import { sendMessage } from ".";
import { NFT_Address } from "@src/types"
  
  export const nftMessages = {
    contractAddressValidate: (params: RequestContractAddressValidate) => {
      return sendMessage("pri(nft.contractAddressValidate)", params)
    },
    getCollection: (params: RequestGetCollection) => {
      return sendMessage("pri(nft.getCollection)", params);
    },
    nftsSubscribe: (cb: (nfts: NFT_Address) => void) => {
        return sendMessage("pri(nft.subscription)", null, cb);
      },
  };
  