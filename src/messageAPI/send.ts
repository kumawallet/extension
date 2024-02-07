import {
  RequestSendEvmTx,
  RequestSendSubstrateTx,
} from "@src/entries/background/handlers/request-types";
import { sendMessage } from ".";

export const sendMessages = {
  sendSubstrateTx: (params: RequestSendSubstrateTx) => {
    return sendMessage("pri(send.sendSubstrateTx)", params);
  },
  sendEvmTx: (params: RequestSendEvmTx) => {
    return sendMessage("pri(send.sendEvmTx)", params);
  },
};
