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

  const createAccount = async ({ name, password, confirmPassword }: any) => {
    try {
      if (password !== confirmPassword) {
        throw new Error("Password does not match");
      }
      const seed = mnemonicGenerate(24);
      return Extension.signUp({ password, name, seed });
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
  }: any) => {
    try {
      return Extension.importAccount({
        name,
        privateKeyOrSeed,
        password,
        accountType,
      });
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
