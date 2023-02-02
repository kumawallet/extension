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
    getAllAccounts: () => Promise<Account[]>;
    getSelectedAccount: () => Promise<Account | undefined>;
    setSelectedAccount: (account: Account) => void;
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
      return accounts;
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

  const setSelectedAccount = async (account: Account) => {
    await Storage.getInstance().setSelectedAccount(account);
    getSelectedAccount();
  };


  return (
    <AccountContext.Provider
      value={{
        state,
        getAllAccounts,
        getSelectedAccount,
        setSelectedAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccountContext = () => useContext(AccountContext);
