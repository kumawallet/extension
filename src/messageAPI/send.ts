import { RequestUpdateTx,RequestUpdateTxNFT } from "@src/entries/background/handlers/request-types";
import { sendMessage } from ".";

export const sendMessages = {
  sendTx: () => {
    return sendMessage("pri(send.sendTx)");
  },

  getFee: (cb: (fee: string) => void) => {
    return sendMessage("pri(send.getFeeSubscribe)", null, cb);
  },
  updateTx: (params: RequestUpdateTx) => {
    return sendMessage("pri(send.updateTx)", params);
  },
  sendTxNFT: () => {
    return sendMessage("pri(send.sendTxNFT)");
  },

  getFeeNFT: (cb: (fee: string) => void) => {
    return sendMessage("pri(send.getFeeNFTSubscribe)", null, cb);
  },
  updateTxNFT: (params: RequestUpdateTxNFT) => {
    return sendMessage("pri(send.updateTxNFT)", params);
  }, 
};
