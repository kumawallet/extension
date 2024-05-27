import {
  RequestAddAsset,
  RequestGetAssetsByChain,
} from "@src/entries/background/handlers/request-types";
import { sendMessage } from ".";
import { AssetBalance } from "@src/storage/entities/AssetBalance";

export const assetsMessages = {
  addAsset: (params: RequestAddAsset) => {
    return sendMessage("pri(assets.addAsset)", params);
  },
  getAssetsByChain: (params: RequestGetAssetsByChain) => {
    return sendMessage("pri(assets.getAssetsByChain)", params);
  },
  getAssetsBalance: (cb: (asset: AssetBalance) => void) => {
    return sendMessage("pri(assestsBanlance.subscription)", null, cb);
  },
};
