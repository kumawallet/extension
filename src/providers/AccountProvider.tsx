import { useEffect } from "react";
import Extension from "../utils/Extension";
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
  selectedAccount: string;
}

const initialState: InitialState = {
  accounts: [],
  isLoadingAccounts: true,
  selectedAccount: "",
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
  const ext = Extension.getInstance();

  useEffect(() => {
    (async () => {
      const accounts = await ext.getAllAccounts();
      //TODO: get selected account from localstorage
      let address = "";
      let accountType = "";
      if (accounts.length > 0) { 
        address = accounts[0]?.value?.address;
        accountType = accounts[0]?.type;
      }

      dispatch({
        type: "load-accounts",
        payload: {
          accounts,
          selectedAccount: address,
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
