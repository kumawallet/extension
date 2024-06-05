import { RequestSetAccountToActivity } from "@src/entries/background/handlers/request-types";
import { sendMessage } from ".";
import { Transaction } from "@src/types";

export const activityMessages = {
  getActivity: () => {
    return sendMessage("pri(activity.getActivity)");
  },
  getHistoricActivity: () => {
    return sendMessage("pri(activity.getHistoricActivity)");
  },
  activitySubscribe: (cb: (value: Transaction[]) => void) => {
    return sendMessage("pri(activity.activitySubscribe)", null, cb);
  },
  setAccountToActivity: (params: RequestSetAccountToActivity) => {
    return sendMessage("pri(activity.setAccountToActivity)", params);
  },
};
