import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react";

import { Action, InitialState, TxContext } from "./types";
import { messageAPI } from "@src/messageAPI/api";

const initialState: InitialState = {
  activity: [],
  hasNextPage: false,
  isLoading: true,
};

const TxContext = createContext({} as TxContext);

export const reducer = (state: InitialState, action: Action): InitialState => {
  switch (action.type) {
    case "init-activity": {
      const { activity, hasNextPage } = action.payload;

      return {
        ...state,
        activity,
        hasNextPage,
        isLoading: false,
      };
    }
    case "load-more-activity": {
      return {
        ...state,
        isLoading: true,
      };
    }
    case "update-activity-status": {
      const { hash, status, error } = action.payload;

      const _activity = [...state.activity];
      const index = _activity.findIndex((a) => a.hash === hash);
      if (index !== -1) {
        _activity[index].status = status;
        // @ts-expect-error -- *

        _activity[index].error = error;
      }

      return {
        ...state,
        activity: _activity,
      };
    }
    default:
      return state;
  }
};

export const TxProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadMoreActivity = async () => {
    dispatch({
      type: "loading-activity",
    });

    const { transactions, hasNextPage } =
      await messageAPI.getHistoricActivity();
    dispatch({
      type: "load-more-activity",
      payload: {
        activity: transactions,
        hasNextPage,
      },
    });
  };

  return (
    <TxContext.Provider
      value={{
        state,
        loadMoreActivity,
      }}
    >
      {children}
    </TxContext.Provider>
  );
};

export const useTxContext = () => useContext(TxContext);
