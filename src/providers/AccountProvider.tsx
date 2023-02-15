import Extension from "../Extension";
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useReducer,
} from "react";
import { useToast } from "../hooks";
import { useNetworkContext } from "./NetworkProvider";
import { transformAddress } from "@src/utils/account-utils";
import { DEFAULT_WASM_CHAIN, DEFAULT_EVM_CHAIN } from "../constants/chains";
import Account from "@src/storage/entities/Account";
import { AccountType } from "@src/accounts/types";
import { useAuthContext } from "./AuthProvider";
import { AccountFormType } from "@src/pages";

interface InitialState {
  accounts: Account[];
  isLoadingAccounts: boolean;
  selectedAccount: Account;
}

const initialState: InitialState = {
  accounts: [],
  isLoadingAccounts: true,
  selectedAccount: {} as Account,
};

const AccountContext = createContext(
  {} as {
    state: InitialState;
    getAllAccounts: (type?: AccountType[] | null) => Promise<Account[]>;
    getSelectedAccount: () => Promise<Account | undefined>;
    setSelectedAccount: (account: Account) => void;
    deriveAccount: (account: AccountFormType) => Promise<boolean>;
    importAccount: (account: AccountFormType) => Promise<boolean>;
    createAccount: (account: AccountFormType) => Promise<boolean>;
  }
);

const reducer = (state: InitialState, action: any): InitialState => {
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
          ...(state.selectedAccount as any),
          value: {
            ...state.selectedAccount.value,
            address,
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
    state: { selectedChain },
    setNewRpc,
    setSelectNetwork,
  } = useNetworkContext();

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
      showErrorToast(error as Error);
      return [];
    }
  };
  const getSelectedAccount = async () => {
    try {
      const selectedAccount = await Extension.getSelectedAccount();

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
      showErrorToast(error as Error);
    }
  };

  const setSelectedAccount = async (account: Account) => {
    try {
      await Extension.setSelectedAccount(account);
      await setNewRpc(account.type);
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
      showErrorToast(error as Error);
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
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccountContext = () => useContext(AccountContext);
