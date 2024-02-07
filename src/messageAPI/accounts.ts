import {
  RequestChangeAccountName,
  RequestCreateAccount,
  RequestDeriveAccount,
  RequestGetAccount,
  RequestGetAllAccounts,
  RequestImportAccount,
  RequestRemoveAccout,
  RequestRestorePassword,
} from "@src/entries/background/handlers/request-types";
import { sendMessage } from ".";
import Account from "@src/storage/entities/Account";

export const accountMessages = {
  createAccounts: (params: RequestCreateAccount): Promise<boolean> => {
    return sendMessage("pri(accounts.createAccounts)", params);
  },
  importAccount: (params: RequestImportAccount) => {
    return sendMessage("pri(accounts.importAccount)", params);
  },
  restorePassword: (params: RequestRestorePassword) => {
    return sendMessage("pri(accounts.restorePassword)", params);
  },
  removeAccount: (params: RequestRemoveAccout) => {
    return sendMessage("pri(accounts.removeAccount)", params);
  },
  changeAccountName: (params: RequestChangeAccountName) => {
    return sendMessage("pri(accounts.changeAccountName)", params);
  },
  areAccountsInitialized: () => {
    return sendMessage("pri(accounts.areAccountsInitialized)", null);
  },
  getAccount: (params: RequestGetAccount) => {
    return sendMessage("pri(accounts.getAccount)", params);
  },
  getAllAccounts: (params: RequestGetAllAccounts) => {
    return sendMessage("pri(accounts.getAllAccounts)", params);
  },
  deriveAccount: (params: RequestDeriveAccount) => {
    return sendMessage("pri(accounts.deriveAccount)", params);
  },
  setSelectedAccount: (params: Account) => {
    return sendMessage("pri(accounts.setSelectedAccount)", params);
  },
  getSelectedAccount: () => {
    return sendMessage("pri(accounts.getSelectedAccount)", null);
  },
};
