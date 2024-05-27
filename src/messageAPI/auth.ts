import {
  RequestSignIn,
  RequestValidatePassword,
  RequestSetAutoLock,
  RequestShowKey,
} from "@src/entries/background/handlers/request-types";
import { sendMessage } from ".";

export const authMessages = {
  isAuthorized: () => {
    return sendMessage("pri(auth.isAuthorized)");
  },
  resetWallet: () => {
    return sendMessage("pri(auth.resetWallet)");
  },
  signIn: (params: RequestSignIn) => {
    return sendMessage("pri(auth.signIn)", params);
  },
  validatePassword: (param: RequestValidatePassword) => {
    return sendMessage("pri(auth.validatePassword)", param);
  },
  unlock: () => {
    return sendMessage("pri(auth.unlock)");
  },
  setAutoLock: (param: RequestSetAutoLock) => {
    return sendMessage("pri(auth.setAutoLock)", param);
  },
  getLock: () => {
    return sendMessage("pri(auth.getLock)");
  },
  signOut: () => {
    return sendMessage("pri(auth.signOut)");
  },

  alreadySignedUp: () => {
    return sendMessage("pri(auth.alreadySignedUp)");
  },
  isSessionActive: () => {
    return sendMessage("pri(auth.isSessionActive)");
  },
  showKey: (params: RequestShowKey) => {
    return sendMessage("pri(auth.showKey)", params);
  },
};
