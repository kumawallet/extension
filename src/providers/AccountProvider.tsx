import { useEffect } from "react";
import Extension from "../utils/Extension";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react";

interface SelectedAccount {
  address: "";
  accountType: "";
}

interface InitialState {
  accounts: any[];
  isLoadingAccounts: boolean;
  selectedAccount: SelectedAccount;
}

const initialState: InitialState = {
  accounts: [],
  isLoadingAccounts: true,
  selectedAccount: {
    address: "",
    accountType: "",
  },
};

const AccountContext = createContext(
  {} as {
    state: InitialState;
  }
);

const reducer = (state: InitialState, action: any): InitialState => {
  switch (action.type) {
    case "load-accounts": {
      const { accounts, selectedAccount } = action.payload;

      return {
        accounts,
        isLoadingAccounts: false,
        selectedAccount,
      };
    }
    default:
      return state;
  }
};

export const AccountProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const ext = new Extension({});

  useEffect(() => {
    (async () => {
      const accounts = await ext.getAllAccounts();
      console.log(accounts)

      //TODO: get selected account from localstorage
      let address = "";
      let accountType = "";
      if (accounts.length > 0) { 
        address = Object.keys(accounts[0])[0];
        accountType = accounts[0][address];
      }

      dispatch({
        type: "load-accounts",
        payload: {
          accounts,
          selectedAccount: {
            address,
            accountType,
          },
        },
      });
    })();
  }, []);

  return (
    <AccountContext.Provider
      value={{
        state,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccountContext = () => useContext(AccountContext);
