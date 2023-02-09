import { useEffect } from "react";
import Extension from "../Extension";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react";
import { Account } from "@src/storage/entities/Accounts";
import { useToast } from "../hooks";
import { useNetworkContext } from "./NetworkProvider";
import { getAccountType, transformAddress } from "@src/utils/account-utils";
import { AccountType } from "../accounts/AccountManager";
import { CHAINS } from "../contants/chains";

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
    state: { selectedChain },
    setNewRpc,
    setSelectNetwork,
  } = useNetworkContext();

  const { showErrorToast } = useToast();

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (selectedChain?.name) {
      (async () => {
        const newChainType = selectedChain.supportedAccounts;

        const accounts = await getAllAccounts(newChainType);

        const selectedAccountType = getAccountType(state.selectedAccount?.type);

        if (!newChainType.includes(selectedAccountType)) {
          setSelectedAccount(accounts[0]);
          setNewRpc(accounts[0].type);
          return;
        }

        setNewRpc(selectedAccountType);
      })();
    }
  }, [selectedChain?.name]);

  const getAllAccounts = async (type: AccountType[] | null = null) => {
    try {
      const accounts = await Extension.getAllAccounts(type);

      const thereAreWasmAccounts = accounts.some((acc) =>
        acc.key.includes("WASM")
      );

      if (!thereAreWasmAccounts) {
        setSelectNetwork(CHAINS[0].chains[3]);
      }

      dispatch({
        type: "set-accounts",
        payload: {
          accounts,
        },
      });
      return accounts;
    } catch (error) {
      showErrorToast(error);
      return [];
    }
  };

  useEffect(() => {
    if (state.selectedAccount?.value?.address) {
      const newAddress = transformAddress(
        state.selectedAccount.value.address,
        selectedChain?.addressPrefix
      );
      dispatch({
        type: "change-selected-address-format",
        payload: {
          address: newAddress,
        },
      });
    }
  }, [selectedChain?.name, state?.selectedAccount?.key]);

  const getSelectedAccount = async () => {
    try {
      const selectedAccount = await Extension.getSelectedAccount();

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

      const actualType = getAccountType(state.selectedAccount.type);
      const newType = getAccountType(selectedAccount?.type);

      if (actualType !== newType) {
        setNewRpc(selectedAccount?.type || "");
      }

      return selectedAccount;
    } catch (error) {
      showErrorToast(error);
    }
  };

  const setSelectedAccount = async (account: Account) => {
    try {
      await Extension.setSelectedAccount(account);
      getSelectedAccount();
    } catch (error) {
      showErrorToast(error);
    }
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
