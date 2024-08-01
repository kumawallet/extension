import {
    RequestInitHydradx,
    RequestGetFeeHydra
  } from "@src/entries/background/handlers/request-types";
  import { sendMessage } from ".";
import { SwapAsset } from "@src/pages/swap/base";
  
  export const hydraDx = {
    initHydraDX: (params: RequestInitHydradx) => {
      return sendMessage("pri(hydra.initHydraDX)", params);
    },
    hydraSubscribeToSell: (cb: (assetsToSell: SwapAsset[]) => void) => {
        return sendMessage("pri(hydra.subscribeToSell)", null, cb);
      },
    hydraSubscribeToBuy: (cb: (assetsToBuy: SwapAsset[]) => void) => {
        return sendMessage("pri(hydra.subscribeToBuy)", null, cb);
      },
    getFeeHydra:(params : RequestGetFeeHydra) => {
        return sendMessage("pri(hydra.getFee)",params);
    }
  };