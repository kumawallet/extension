import { useEffect } from "react";
import Extension from "../utils/Extension";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react";
import { mnemonicGenerate } from "@polkadot/util-crypto";

interface InitialState {
  isInit: boolean;
}

const initialState: InitialState = {
  isInit: true,
};

const AuthContext = createContext(
  {} as {
    state: InitialState;
    createAccount: (newAccount: any) => Promise<boolean>;
    importAccount: (newAccount: any) => Promise<boolean>;
    deriveAccount: (newAccount: any) => Promise<boolean>;
  }
);

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
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      dispatch({
        type: "init",
        payload: {},
      });
    })();
  }, []);

  const createAccount = async ({ name, password, seed, isSignUp }: any) => {
    try {
      return Extension.createAccounts({ name, password, seed, isSignUp });
    } catch (error) {
      console.log(error as string);
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
      console.log(error as string);
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
      console.log(error as string);
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
