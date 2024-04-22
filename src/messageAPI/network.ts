import {
  RequestGetXCMChains,
  RequestRemoveCustomChain,
  RequestSaveCustomChain,
  RequestSetNetwork,
  RequestDeleteSelectNetwork
} from "@src/entries/background/handlers/request-types";
import { sendMessage } from ".";

export const networkMessages = {
  setNetwork: (params: RequestSetNetwork) => {
    return sendMessage("pri(network.setNetwork)", params);
  },
  deleteSelectChain : (params : RequestDeleteSelectNetwork) =>{
    return sendMessage("pri(network.deleteSelectNetwork)", params);
  },
  getNetwork: () => {
    return sendMessage("pri(network.getNetwork)");
  },
  networkSubscribe: (cb: (network: {})=> void) => {
    return sendMessage("pri(network.subscription)",null,cb)
  },
  getAllChains: () => {
    return sendMessage("pri(network.getAllChains)");
  },
  saveCustomChain: (params: RequestSaveCustomChain) => {
    return sendMessage("pri(network.saveCustomChain)", params);
  },
  removeCustomChain: (params: RequestRemoveCustomChain) => {
    return sendMessage("pri(network.removeCustomChain)", params);
  },
  getCustomChains: () => {
    return sendMessage("pri(network.getCustomChains)");
  },
  getXCMChains: (params: RequestGetXCMChains) => {
    return sendMessage("pri(network.getXCMChains)", params);
  },
};
