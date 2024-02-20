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
import { AccountFormType } from "@src/pages";
import { useToast } from "@src/hooks";
import { useNetworkContext } from "../networkProvider/NetworkProvider";
import { transformAddress } from "@src/utils/account-utils";
import { DEFAULT_WASM_CHAIN, DEFAULT_EVM_CHAIN } from "@src/constants/chains";
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
      const { name } = action.payload;
      const {
        selectedAccount: { key },
      } = state;
      return {
        ...state,
        accounts: state.accounts.map((account) => {
          if (account.key === key) {
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
            name,
          },
        },
      };
    }
    default:
      return state;
  }
};

export const AccountProvider: FC<PropsWithChildren> = ({ children }) => {


  const {
    state: { selectedChain, rpc },
    setNewRpc,
    setSelectNetwork,
  } = useNetworkContext();
  const { t: tCommon } = useTranslation("common");
  const { showErrorToast } = useToast();

  const [state, dispatch] = useReducer(reducer, initialState);

  const getImportedType = (type: AccountType) => {
    if (type === AccountType.EVM) return AccountType.IMPORTED_EVM;
    if (type === AccountType.WASM) return AccountType.IMPORTED_WASM;
    return type;
  };

  const getAllAccounts = async (type: AccountType[] | null = null) => {
    try {
      const _type = type || selectedChain?.supportedAccounts;
      const accounts = await messageAPI.getAllAccounts({
        type: _type,
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
        },
      });
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon("failed_to_update_account"));
    }
  };

  const getSelectedAccount = async () => {
    try {

      const selectedAccount = await messageAPI.getSelectedAccount();

      if (!selectedAccount) return null;

      const { chain: selectedChain } = await messageAPI.getNetwork();

      // for first time when there is no default chain selected
      if (!selectedChain) {
        const selectedAccountIsWasm = selectedAccount?.key.includes("WASM");
        setSelectNetwork(
          selectedAccountIsWasm ? DEFAULT_WASM_CHAIN : DEFAULT_EVM_CHAIN
        );
      }

      dispatch({
        type: "set-selected-account",
        payload: {
          selectedAccount: {
            ...selectedAccount,
            value: {
              ...selectedAccount?.value,
              address: transformAddress(
                selectedAccount?.value?.address as string,
                selectedChain?.addressPrefix
              ),
            },
          },
        },
      });

      return selectedAccount;
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon(error as string));
    }
  };

  const setSelectedAccount = async (account: Account, changeRpc = true) => {
    try {
      await messageAPI.setSelectedAccount(account);
      changeRpc && (await setNewRpc(account.type));
      dispatch({
        type: "set-selected-account",
        payload: {
          selectedAccount: {
            ...account,
            value: {
              ...account?.value,
              address: transformAddress(
                account?.value?.address as string,
                selectedChain?.addressPrefix
              ),
            },
          },
        },
      });
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon(error as string));
    }
  };

  const deriveAccount = useCallback(async (account: AccountFormType) => {
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
  }, []);

  const importAccount = useCallback(async (account: AccountFormType) => {
    try {
      const isSessionActive = await messageAPI.isSessionActive();

      if (!isSessionActive && !account.password) throw new Error("password_required");
      if (!account.privateKeyOrSeed) throw new Error("private_key_or_seed_required");
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
      return false
    }
  }, []);

  const createAccount = useCallback(async (account: AccountFormType) => {
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


  const restorePassword = useCallback(async ({
    privateKeyOrSeed,
    password: newPassword,
  }: AccountFormType) => {
    try {
      if (!privateKeyOrSeed) throw new Error("recovery_phrase_required");
      if (!newPassword) throw new Error("password_required");
      await messageAPI.restorePassword({
        privateKeyOrSeed,
        newPassword
      });
      return true;
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon("failed_to_restore_password"));
      return false;
    }
  }, []);

  useEffect(() => {
    if (rpc) {
      getSelectedAccount();
    }
  }, [rpc]);

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
        restorePassword,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccountContext = () => useContext(AccountContext);
