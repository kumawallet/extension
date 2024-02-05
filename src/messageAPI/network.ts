import {
  RequestGetXCMChains,
  RequestRemoveCustomChain,
  RequestSaveCustomChain,
  RequestSetNetwork,
} from "@src/entries/background/handlers/request-types";
import { sendMessage } from ".";

export const networkMessages = {
  setNetwork: (params: RequestSetNetwork) => {
    return sendMessage("pri(network.setNetwork)", params);
  },
  getNetwork: () => {
    return sendMessage("pri(network.getNetwork)", null);
  },
  getAllChains: () => {
    return sendMessage("pri(network.getAllChains)", null);
  },
  saveCustomChain: (params: RequestSaveCustomChain) => {
    return sendMessage("pri(network.saveCustomChain)", params);
  },
  removeCustomChain: (params: RequestRemoveCustomChain) => {
    return sendMessage("pri(network.removeCustomChain)", params);
  },
  getXCMChains: (params: RequestGetXCMChains) => {
    return sendMessage("pri(network.getXCMChains)", params);
  },
};
