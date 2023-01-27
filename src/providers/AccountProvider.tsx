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
    getAllAccounts: () => void;
    getSelectedAccount: () => void;
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
    // (async () => {
    //   const accounts = await ext.getAllAccounts();
    //   //TODO: get selected account from localstorage
    //   let address = "";
    //   let accountType = "";
    //   let accountKey = "";
    //   if (accounts.length > 0) {
    //     const account = accounts[0];
    //     accountKey = account?.key;
    //     address = account?.address;
    //     accountType = account?.type;
    //   }

    //   dispatch({
    //     type: "set-accounts",
    //     payload: {
    //       accounts,
    //       selectedAccount: address,
    //     },
    //   });
    // })();
    getAllAccounts();
  }, []);

  const getAllAccounts = async () => {
    try {
      const accounts = await ext.getAllAccounts();
      dispatch({
        type: "set-account",
        payload: {
          accounts,
        },
      });
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
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AccountContext.Provider
      value={{
        state,
        getAllAccounts,
        getSelectedAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccountContext = () => useContext(AccountContext);
