import {
  RequestAddActivity,
  RequestSetAccountToActivity,
  RequestUpdateActivity,
} from "@src/entries/background/handlers/request-types";
import { sendMessage } from ".";
import { Transaction } from "@src/types";

export const activityMessages = {
  getActivity: () => {
    return sendMessage("pri(activity.getActivity)");
  },
  addActivity: (params: RequestAddActivity) => {
    return sendMessage("pri(activity.addActivity)", params);
  },
  updateActivity: (params: RequestUpdateActivity) => {
    return sendMessage("pri(activity.updateActivity)", params);
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
