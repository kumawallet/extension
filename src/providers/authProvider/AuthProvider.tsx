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
import { AccountType } from "@src/accounts/types";
import { captureError } from "@src/utils/error-handling";

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

const getImportedType = (type: AccountType) => {
  if (type === AccountType.EVM) return AccountType.IMPORTED_EVM;
  if (type === AccountType.WASM) return AccountType.IMPORTED_WASM;
  return type;
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
      captureError(error);
      showErrorToast(tCommon("failed_to_create_account"));
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
      const isSessionActive = await Extension.isSessionActive();
      if (!password && !isSessionActive) throw new Error("password_required");
      if (!privateKeyOrSeed) throw new Error("private_key_or_seed_required");
      if (!accountType) throw new Error("account_type_required");
      const type = getImportedType(accountType);
      await Extension.importAccount(
        name,
        privateKeyOrSeed,
        password,
        type,
        isSignUp
      );

      return true;
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon("failed_to_import_account"));
      return false;
    }
  };

  const deriveAccount = async ({ name, accountType }: AccountFormType) => {
    try {
      const isSessionActive = await Extension.isSessionActive();
      if (!isSessionActive) throw new Error("login_required");
      if (!accountType) throw new Error("account_type_required");
      await Extension.deriveAccount(name, accountType);
      return true;
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon("failed_to_derive_account"));
      return false;
    }
  };

  const restorePassword = async ({
    privateKeyOrSeed,
    password: newPassword,
  }: AccountFormType) => {
    try {
      if (!privateKeyOrSeed) throw new Error("recovery_phrase_required");
      if (!newPassword) throw new Error("password_required");
      await Extension.restorePassword(privateKeyOrSeed, newPassword);
      return true;
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon("failed_to_restore_password"));
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
