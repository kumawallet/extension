import { useEffect } from "react";
import Extension from "../utils/Extension";
import { formatAccount } from "../utils/account-utils";
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

      //TODO: get selected account from localstorage
      const _account = Object.keys(accounts[0])[0];

      const { address, type } = formatAccount(_account);

      dispatch({
        type: "load-accounts",
        payload: {
          accounts,
          selectedAccount: {
            address,
            accountType: type,
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
