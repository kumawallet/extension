import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@src/hooks";
import { useNetworkContext } from "../networkProvider/NetworkProvider";
import Account from "@src/storage/entities/Account";
import { AccountKey, AccountType } from "@src/accounts/types";
import { Action, AccountContext, InitialState } from "./types";
import { captureError } from "@src/utils/error-handling";
import { messageAPI } from "@src/messageAPI/api";

const initialState: InitialState = {
  accounts: [],
  isLoadingAccounts: true,
  selectedAccount: {} as Account,
};

const AccountContext = createContext({} as AccountContext);

export const reducer = (state: InitialState, action: Action): InitialState => {
  switch (action.type) {
    case "set-accounts": {
      const { accounts } = action.payload;

      return {
        ...state,
        accounts,
        isLoadingAccounts: false,
      };
    }
    case "set-selected-account": {
      const { selectedAccount } = action.payload;

      return {
        ...state,
        selectedAccount,
      };
    }
    case "change-selected-address-format": {
      const { address } = action.payload;

      return {
        ...state,
        selectedAccount: {
          ...state.selectedAccount,
          value: {
            ...state.selectedAccount.value,
            address,
          },
        },
      };
    }
    case "update-account-name": {
      const { name, accountKey } = action.payload;
      const {
        selectedAccount: { key, value },
      } = state;

      const newName = accountKey === key ? name : value.name;
      return {
        ...state,
        accounts: state.accounts.map((account) => {
          if (account.key === accountKey) {
            return {
              ...account,
              value: {
                ...account.value,
                name,
              },
            };
          }
          return account;
        }),
        selectedAccount: {
          ...state.selectedAccount,
          value: {
            ...state.selectedAccount.value,
            name: newName,
          },
        },
      };
    }
    case "delete-account": {
      const { key } = action.payload;
      const allAccounts = state.accounts;

      const resultAccounts = allAccounts.filter((account) => account.key !== key)
      return {
        ...state,
        accounts: resultAccounts,
        selectedAccount: resultAccounts[0]
      };
    }
    default:
      return state;
  }
};

export const AccountProvider: FC<PropsWithChildren> = ({ children }) => {
  const {
    state: { selectedChain },
  } = useNetworkContext();
  const { t: tCommon } = useTranslation("common");
  const { showErrorToast } = useToast();

  const [state, dispatch] = useReducer(reducer, initialState);

  const getImportedType = (type: AccountType) => {
    if (type === AccountType.EVM) return AccountType.IMPORTED_EVM;
    if (type === AccountType.WASM) return AccountType.IMPORTED_WASM;
    return type;
  };

  const getAllAccounts = async () => {
    try {
      const accounts = await messageAPI.getAllAccounts({
        type: null,
      });
      dispatch({
        type: "set-accounts",
        payload: {
          accounts,
        },
      });
      return accounts;
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon(error as string));
      return [];
    }
  };

  const updateAccountName = async (accountKey: AccountKey, name: string) => {
    try {
      await messageAPI.changeAccountName({ key: accountKey, newName: name });
      dispatch({
        type: "update-account-name",
        payload: {
          name,
          accountKey
        },
      });
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon("failed_to_update_account"));
    }
  };

  const deleteAccount = async (key: AccountKey) => {
    try {
      await messageAPI.removeAccount({ key: key });
      const allAccounts = state.accounts;
      if (allAccounts.length > 1) {
        dispatch({
          type: "delete-account",
          payload: {
            key,
          },
        });
        return "successful";
      }
      else {
        return null;
      }
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon("failed_to_update_account"));
    }
  };

  const getSelectedAccount = async () => {
    try {
      const selectedAccount = await messageAPI.getSelectedAccount();

      if (!selectedAccount) return null;

      dispatch({
        type: "set-selected-account",
        payload: {
          selectedAccount: selectedAccount,
        },
      });

      return selectedAccount;
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon(error as string));
    }
  };

  const setSelectedAccount = async (account: Account) => {
    try {
      await messageAPI.setSelectedAccount(account);
      dispatch({
        type: "set-selected-account",
        payload: {
          selectedAccount: {
            ...account,
          },
        },
      });
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon(error as string));
    }
  };

  const deriveAccount = useCallback(
    async (account: { name: string; accountType: AccountType }) => {
      try {
        const isSessionActive = await messageAPI.isSessionActive();
        if (!isSessionActive) throw new Error("login_required");
        if (!account.accountType) throw new Error("account_type_required");
        await messageAPI.deriveAccount({
          name: account.name,
          type: account.accountType,
        });
        await getSelectedAccount();
        return true;
      } catch (error) {
        captureError(error);
        showErrorToast(tCommon("failed_to_derive_account"));
        return false;
      }
    },
    []
  );

  const importAccount = useCallback(async (account: {
    name: string;
    privateKeyOrSeed: string;
    password: string;
    accountType: AccountType;
    isSignUp: boolean;
  }) => {
    try {
      const isSessionActive = await messageAPI.isSessionActive();

      if (!isSessionActive && !account.password)
        throw new Error("password_required");
      if (!account.privateKeyOrSeed)
        throw new Error("private_key_or_seed_required");
      if (!account.accountType) throw new Error("account_type_required");
      const type = getImportedType(account.accountType);
      await messageAPI.importAccount({
        name: account.name,
        privateKeyOrSeed: account.privateKeyOrSeed,
        password: account.password,
        type,
        isSignUp: account.isSignUp,
      });
      await getSelectedAccount();
      return true;
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon("failed_to_import_account"));
      return false;
    }
  }, []);

  const createAccount = useCallback(async (account: {
    name: string;
    seed: string;
    password: string;
    isSignUp: boolean;
  }) => {
    try {
      if (!account.seed) throw new Error("seed_required");
      await messageAPI.createAccounts({
        seed: account.seed,
        name: account.name,
        password: account.password,
        isSignUp: account.isSignUp,
      });
      await getSelectedAccount();
      return true;
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon("failed_to_create_account"));
      return false;
    }
  }, []);


  useEffect(() => {
    if (selectedChain?.id) {
      getSelectedAccount();
    }
  }, [selectedChain]);

  useEffect(() => {
    getAllAccounts();
  }, []);

  return (
    <AccountContext.Provider
      value={{
        state,
        getAllAccounts,
        getSelectedAccount,
        setSelectedAccount,
        deriveAccount,
        importAccount,
        createAccount,
        updateAccountName,
        deleteAccount,

      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccountContext = () => useContext(AccountContext);
