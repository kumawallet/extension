import { useEffect } from "react";
import Extension from "../utils/Extension";
import Storage from "../utils/storage/Storage";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react";
import { AccountType } from "@src/utils/handlers/AccountManager";

interface InitialState {
  accounts: any[];
  isLoadingAccounts: boolean;
  selectedAccount: {
    address: string;
    type: string;
  };
}

const initialState: InitialState = {
  accounts: [],
  isLoadingAccounts: true,
  selectedAccount: {
    address: "",
    type: "",
  },
};

const AccountContext = createContext(
  {} as {
    state: InitialState;
    getAllAccounts: () => Promise<any[]>;
    getSelectedAccount: () => void;
    setSelectedAccount: (account: any) => void;
    derivateAccount: (
      name: string,
      accountType: AccountType
    ) => Promise<boolean>;
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
    default:
      return state;
  }
};

export const AccountProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const ext = Extension.getInstance();
  const stg = Storage.getInstance();

  useEffect(() => {
    getAllAccounts();
  }, []);

  const getAllAccounts = async () => {
    try {
      const accounts = await ext.getAllAccounts();
      dispatch({
        type: "set-accounts",
        payload: {
          accounts,
        },
      });
      return accounts;
    } catch (error) {
      console.log(error);
    }
  };

  const getSelectedAccount = async () => {
    try {
      const selectedAccount = await stg.getSelectedAccount();
      dispatch({
        type: "set-selected-account",
        payload: {
          selectedAccount,
        },
      });
      return selectedAccount;
    } catch (error) {
      console.log(error);
    }
  };

  // TODO: add account type
  const setSelectedAccount = async (account: any) => {
    await stg.setSelectedAccount(account);
    getSelectedAccount();
  };

  const derivateAccount = async (name: string, accountType: AccountType) => {
    ext.accountType = accountType;
    return await ext.derivateAccount(name);
  };

  return (
    <AccountContext.Provider
      value={{
        state,
        getAllAccounts,
        getSelectedAccount,
        setSelectedAccount,
        derivateAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccountContext = () => useContext(AccountContext);
