import {
  RequestAddTrustedSite,
  RequestRemoveTrustedSite,
} from "@src/entries/background/handlers/request-types";
import { sendMessage } from ".";

export const trustedSitesMessages = {
  getTrustedSites: () => {
    return sendMessage("pri(trustedSites.getTrustedSites)", null);
  },
  addTrustedSite: (params: RequestAddTrustedSite) => {
    return sendMessage("pri(trustedSites.addTrustedSite)", params);
  },
  removeTrustedSite: (params: RequestRemoveTrustedSite) => {
    return sendMessage("pri(trustedSites.removeTrustedSite)", params);
  },
};
