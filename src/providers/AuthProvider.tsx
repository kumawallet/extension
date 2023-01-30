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
        payload: {
        },
      });
    })();
  }, []);

  const createAccount = async ({ name, password, confirmPassword }: any) => {
    try {
      if (password !== confirmPassword) {
        throw new Error("Password does not match");
      }
      const seed = mnemonicGenerate(24);
      await Extension.signUp({ password, name, seed });
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
