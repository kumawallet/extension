import { useToast } from "../hooks";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react";
import Extension from "../utils/Extension";
import { AccountForm } from "../components/accountForm/AccountForm";

type NewAccount = AccountForm & { seed?: string };

interface InitialState {
  isInit: boolean;
}

const initialState: InitialState = {
  isInit: true,
};

interface AuthContext {
  state: InitialState;
  createAccount: (newAccount: NewAccount) => Promise<boolean>;
  importAccount: (newAccount: NewAccount) => Promise<boolean>;
  deriveAccount: (newAccount: NewAccount) => Promise<boolean>;
}

const AuthContext = createContext({} as AuthContext);

const reducer = (state: InitialState, action: any): InitialState => {
  switch (action.type) {
    case "init": {
      return {
        ...action.payload,
        isInit: false,
      };
    }
    default:
      return state;
  }
};

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const { showErrorToast } = useToast();

  const [state] = useReducer(reducer, initialState);

  const createAccount = async ({
    name,
    password,
    seed,
    isSignUp,
  }: NewAccount) => {
    try {
      await Extension.createAccounts({ name, password, seed, isSignUp });
      return true;
    } catch (error) {
      showErrorToast(error);
      return false;
    }
  };

  const importAccount = async ({
    name,
    privateKeyOrSeed,
    password,
    accountType,
    isSignUp,
  }: NewAccount) => {
    try {
      const isUnlocked = await Extension.isUnlocked();
      if (!password && !isUnlocked) {
        throw new Error("Password is required");
      }
      await Extension.importAccount({
        name,
        privateKeyOrSeed,
        password,
        accountType,
        isSignUp,
      });
      return true;
    } catch (error) {
      showErrorToast(error);
      return false;
    }
  };

  const deriveAccount = async ({ name, accountType }: NewAccount) => {
    try {
      const isUnlocked = await Extension.isUnlocked();
      if (!isUnlocked) {
        throw new Error("Extension is locked");
      }
      const account = await Extension.deriveAccount({ name, accountType });
      await Extension.setSelectedAccount(account);
      return true;
    } catch (error) {
      showErrorToast(error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        createAccount,
        importAccount,
        deriveAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
