import {
  RequestAddAsset,
  RequestGetAssetsByChain,
} from "@src/entries/background/handlers/request-types";
import { sendMessage } from ".";

export const assetsMessages = {
  addAsset: (params: RequestAddAsset) => {
    return sendMessage("pri(assets.addAsset)", params);
  },
  getAssetsByChain: (params: RequestGetAssetsByChain) => {
    return sendMessage("pri(assets.getAssetsByChain)", params);
  },
};
