import { accountMessages } from "./accounts";
import { activityMessages } from "./activity";
import { authMessages } from "./auth";
import { contactsMessages } from "./contacts";
import { networkMessages } from "./network";
import { assetsMessages } from "./assets";
import { settingsMessages } from "./settings";
import { trustedSitesMessages } from "./trustedSites";
import { swapMessages } from "./swap";

export const messageAPI = {
  ...accountMessages,
  ...activityMessages,
  ...authMessages,
  ...contactsMessages,
  ...networkMessages,
  ...assetsMessages,
  ...settingsMessages,
  ...trustedSitesMessages,
  ...swapMessages,
};
