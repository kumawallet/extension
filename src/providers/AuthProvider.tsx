import { useToast } from "@src/hooks";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react";
import Extension from "../utils/Extension";

interface InitialState {
  isInit: boolean;
}

const initialState: InitialState = {
  isInit: true,
};

interface AuthContext {
  state: InitialState;
  createAccount: (newAccount: any) => Promise<boolean>;
  importAccount: (newAccount: any) => Promise<boolean>;
  deriveAccount: (newAccount: any) => Promise<boolean>;
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

  const [state, dispatch] = useReducer(reducer, initialState);

  const createAccount = async ({ name, password, seed, isSignUp }: any) => {
    try {
      return Extension.createAccounts({ name, password, seed, isSignUp });
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
  }: any) => {
    try {
      const isUnlocked = await Extension.isUnlocked();
      if (!password && !isUnlocked) {
        throw new Error("Password is required");
      }
      return Extension.importAccount({
        name,
        privateKeyOrSeed,
        password,
        accountType,
        isSignUp,
      });
    } catch (error) {
      showErrorToast(error);
      return false;
    }
  };

  const deriveAccount = async ({ name, accountType }: any) => {
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
