import {
  RequestAddActivity,
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
};
