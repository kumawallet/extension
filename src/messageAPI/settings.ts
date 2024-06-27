import {
  RequestGetSetting,
  RequestUpdateSetting,
} from "@src/entries/background/handlers/request-types";
import { sendMessage } from ".";

export const settingsMessages = {
  getGeneralSettings: () => {
    return sendMessage("pri(settings.getGeneralSettings)");
  },
  getAdvancedSettings: () => {
    return sendMessage("pri(settings.getAdvancedSettings)");
  },
  getSetting: (params: RequestGetSetting) => {
    return sendMessage("pri(settings.getSetting)", params);
  },
  updateSetting: (params: RequestUpdateSetting) => {
    return sendMessage("pri(settings.updateSetting)", params);
  },
};
