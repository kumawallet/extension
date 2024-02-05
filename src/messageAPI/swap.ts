import {
  RequestAddSwap,
  RequestSwapProtocol,
} from "@src/entries/background/handlers/request-types";
import { sendMessage } from ".";

export const swapMessages = {
  getSwapsByProtocol: (params: RequestSwapProtocol) => {
    return sendMessage("pri(swap.getSwapsByProtocol)", params);
  },
  addSwap: (params: RequestAddSwap) => {
    return sendMessage("pri(swap.addSwap)", params);
  },
};
