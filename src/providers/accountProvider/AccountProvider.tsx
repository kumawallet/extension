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
import Extension from "@src/Extension";
import { useToast } from "@src/hooks";
import { useNetworkContext } from "../networkProvider/NetworkProvider";
import { transformAddress } from "@src/utils/account-utils";
import { DEFAULT_WASM_CHAIN, DEFAULT_EVM_CHAIN } from "@src/constants/chains";
import Account from "@src/storage/entities/Account";
import { AccountKey, AccountType } from "@src/accounts/types";
import { useAuthContext } from "../authProvider/AuthProvider";
import { Action, AccountContext, InitialState } from "./types";
import { captureError } from "@src/utils/error-handling";

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
    createAccount: _createAccount,
    deriveAccount: _deriveAccount,
    importAccount: _importAccount,
  } = useAuthContext();

  const {
    state: { selectedChain, rpc },
    setNewRpc,
    setSelectNetwork,
  } = useNetworkContext();
  const { t: tCommon } = useTranslation("common");
  const { showErrorToast } = useToast();

  const [state, dispatch] = useReducer(reducer, initialState);

  const getAllAccounts = async (type: AccountType[] | null = null) => {
    try {
      const _type = type || selectedChain?.supportedAccounts;
      const accounts = await Extension.getAllAccounts(_type);
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
    await Extension.changeAccountName(accountKey, name);
    dispatch({
      type: "update-account-name",
      payload: {
        name,
      },
    });
  };

  const getSelectedAccount = async () => {
    try {
      const selectedAccount = await Extension.getSelectedAccount();

      if (!selectedAccount) return null;

      const { chain: selectedChain } = await Extension.getNetwork();

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
      await Extension.setSelectedAccount(account);
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
    const result = await _deriveAccount(account);
    result && (await getSelectedAccount());
    return result;
  }, []);

  const importAccount = useCallback(async (account: AccountFormType) => {
    const result = await _importAccount(account);
    result && (await getSelectedAccount());
    return result;
  }, []);

  const createAccount = useCallback(async (account: AccountFormType) => {
    const result = await _createAccount(account);
    result && (await getSelectedAccount());
    return result;
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
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccountContext = () => useContext(AccountContext);
