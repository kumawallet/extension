import { useToast } from "../hooks";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer,
} from "react";
import Extension from "../Extension";
import { AccountFormType } from "@src/pages";
import { useTranslation } from "react-i18next";
import { useState } from "react";

interface InitialState {
  queue: any;
}

const initialState: InitialState = {
  queue: [],
};

interface TxContext {
  state: InitialState;
  // createAccount: (account: AccountFormType) => Promise<boolean>;
  // importAccount: (account: AccountFormType) => Promise<boolean>;
  // deriveAccount: (account: AccountFormType) => Promise<boolean>;
  // restorePassword: (account: AccountFormType) => Promise<boolean>;
}

const TxContext = createContext({} as TxContext);

const reducer = (state: InitialState, action: any): InitialState => {
  switch (action.type) {
    // case "init": {
    //   return {
    //     ...action.payload,
    //     isInit: false,
    //   };
    // }
    default:
      return state;
  }
};

export const TxProvider: FC<PropsWithChildren> = ({ children }) => {
  const { t: tCommon } = useTranslation("common");
  const { showErrorToast } = useToast();

  const [state] = useReducer(reducer, initialState);

  const addTx = () => {
    ///
  };

  useEffect(() => {
    ///
  }, [state.queue]);

  return (
    <TxContext.Provider
      value={{
        state,
      }}
    >
      {children}
    </TxContext.Provider>
  );
};

export const useTxContext = () => useContext(TxContext);
