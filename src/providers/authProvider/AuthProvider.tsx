import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "../../hooks";
import Extension from "../../Extension";
import { AccountFormType } from "../../pages";
import { Action, AuthContext as IAuthContext, InitialState } from "./types";
import { AccountType } from "../../accounts/types";

const initialState: InitialState = {
  isInit: true,
};

export const AuthContext = createContext({} as IAuthContext);

export const reducer = (state: InitialState, action: Action): InitialState => {
  switch (action.type) {
    default:
      return state;
  }
};

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const { t: tCommon } = useTranslation("common");
  const { showErrorToast } = useToast();

  const [state] = useReducer(reducer, initialState);

  const createAccount = async ({
    name,
    password,
    seed,
    isSignUp,
  }: AccountFormType) => {
    try {
      if (!seed) throw new Error("seed_required");
      await Extension.createAccounts(seed, name, password, isSignUp);
      return true;
    } catch (error) {
      showErrorToast(tCommon(error as string));
      return false;
    }
  };

  const importAccount = async ({
    name,
    privateKeyOrSeed,
    password,
    accountType,
    isSignUp,
  }: AccountFormType) => {
    try {
      const isUnlocked = await Extension.isUnlocked();
      if (!password && !isUnlocked) throw new Error("password_required");
      if (!privateKeyOrSeed) throw new Error("private_key_or_seed_required");
      if (!accountType) throw new Error("account_type_required");
      await Extension.importAccount(
        name,
        privateKeyOrSeed,
        password,
        accountType as AccountType.IMPORTED_EVM | AccountType.IMPORTED_WASM,
        isSignUp
      );

      return true;
    } catch (error) {
      showErrorToast(tCommon(error as string));
      return false;
    }
  };

  const deriveAccount = async ({ name, accountType }: AccountFormType) => {
    try {
      const isUnlocked = await Extension.isUnlocked();
      if (!isUnlocked) throw new Error("failed_to_derive_account");
      if (!accountType) throw new Error("account_type_required");
      await Extension.deriveAccount(name, accountType);
      return true;
    } catch (error) {
      showErrorToast(tCommon(error as string));
      return false;
    }
  };

  const restorePassword = async ({
    privateKeyOrSeed: recoveryPhrase,
    password: newPassword,
  }: AccountFormType) => {
    try {
      if (!recoveryPhrase) throw new Error("recovery_phrase_required");
      if (!newPassword) throw new Error("password_required");
      await Extension.restorePassword(recoveryPhrase, newPassword);
      return true;
    } catch (error) {
      showErrorToast(tCommon(error as string));
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
        restorePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
