import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react";
import Extension from "../utils/Extension";
import { mnemonicGenerate } from "@polkadot/util-crypto";
import { useToast } from "@hooks/index";

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

  // useEffect(() => {
  //   (async () => {
  //     dispatch({
  //       type: "init",
  //       payload: {},
  //     });
  //   })();
  // }, []);

  const createAccount = async ({ name, password, confirmPassword }: any) => {
    try {
      if (password !== confirmPassword) {
        throw new Error("Password does not match");
      }
      const seed = mnemonicGenerate(24);
      return Extension.signUp({ password, name, seed });
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
  }: any) => {
    try {
      return Extension.importAccount({
        name,
        privateKeyOrSeed,
        password,
        accountType,
      });
    } catch (error) {
      showErrorToast(error);
      return false;
    }
  };

  const deriveAccount = async ({ name, accountType }: any) => {
    try {
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
