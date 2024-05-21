import {
  RequestAddActivity,
  RequestSetAccountToActivity,
  RequestUpdateActivity,
} from "@src/entries/background/handlers/request-types";
import { sendMessage } from ".";

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
  activitySubscribe: (cb: (value: any) => void) => {
    return sendMessage("pri(activity.activitySubscribe)", null, cb);
  },
  setAccountToActivity: (params: RequestSetAccountToActivity) => {
    return sendMessage("pri(activity.setAccountToActivity)", params);
  },
};
