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
import { Account } from "@src/utils/storage/entities/Accounts";
import { AccountType } from "@src/utils/AccountManager";

interface InitialState {
  accounts: {
    key: string;
    address: string;
    name: string;
    type: AccountType;
  }[];
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
    getAllAccounts: () => Promise<
      {
        key: string;
        address: string;
        name: string;
        type: AccountType;
      }[]
    >;
    getSelectedAccount: () => void;
    setSelectedAccount: (account: Account) => void;
    derivateAccount: (
      name: string,
      accountType: AccountType
    ) => Promise<Account>;
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

  useEffect(() => {
    getAllAccounts();
  }, []);

  const getAllAccounts = async () => {
    try {
      const accounts = await Extension.getAllAccounts();
      dispatch({
        type: "set-accounts",
        payload: {
          accounts,
        },
      });
      return accounts || [];
    } catch (error) {
      console.log(error);
    }
  };

  const getSelectedAccount = async () => {
    try {
      const selectedAccount = await Storage.getInstance().getSelectedAccount();
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

  const setSelectedAccount = async (account: any) => {
    await Storage.getInstance().setSelectedAccount(account);
    getSelectedAccount();
  };

  const derivateAccount = async (name: string, accountType: AccountType) => {
    return await Extension.derivateAccount(name, accountType);
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
