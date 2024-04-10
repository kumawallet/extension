import { RequestSignIn, RequestValidatePassword, RequestSetAutoLock } from "@src/entries/background/handlers/request-types";
import { sendMessage } from ".";

export const authMessages = {
  isAuthorized: () => {
    return sendMessage("pri(auth.isAuthorized)", null);
  },
  resetWallet: () => {
    return sendMessage("pri(auth.resetWallet)", null);
  },
  signIn: (params: RequestSignIn) => {
    return sendMessage("pri(auth.signIn)", params);
  },
  validatePassword: (param: RequestValidatePassword) => {
    return sendMessage("pri(auth.validatePassword)", param)
  },
  setAutoLock : (param: RequestSetAutoLock) => { 
    return sendMessage("pri(auth.setAutoLock)", param)
  }
  ,
  signOut: () => {
    return sendMessage("pri(auth.signOut)", null);
  },

  alreadySignedUp: () => {
    return sendMessage("pri(auth.alreadySignedUp)", null);
  },
  isSessionActive: () => {
    return sendMessage("pri(auth.isSessionActive)", null);
  },
  showKey: () => {
    return sendMessage("pri(auth.showKey)", null);
  },
};
