import {
    RequestGetFeeHydra,
    RequestGetAssetBuyHydra
  } from "@src/entries/background/handlers/request-types";
  import { sendMessage } from ".";
import { SwapAsset } from "@src/pages/swap/base";
  
  export const hydraDx = {
    initHydraDX: () => {
      return sendMessage("pri(hydra.initHydraDX)");
    },
    hydraSubscribeToSell: (cb: (assetsToSell: SwapAsset[]) => void) => {
        return sendMessage("pri(hydra.subscribeToSell)", null, cb);
      },
    hydraSubscribeToBuy: (cb: (assetsToBuy: SwapAsset[]) => void) => {
        return sendMessage("pri(hydra.subscribeToBuy)", null, cb);
      },
    getFeeHydra:(params : RequestGetFeeHydra) => {
        return sendMessage("pri(hydra.getFee)",params);
    },
    getAssetsBuy : (params: RequestGetAssetBuyHydra) => {
       return sendMessage("pri(hydra.getAssetsBuyHydra)", params)
    },
    clearHydradxTrade: () => {
      return sendMessage("pri(hydra.clearHydradx)");
    }
  };