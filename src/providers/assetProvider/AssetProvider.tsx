import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { Action, AssetContext, InitialState } from "./types";
import { messageAPI } from "@src/messageAPI/api";


export const initialState: InitialState = {
  assets: {},
  isLoadingAssets: true,
};

const AssetContext = createContext({} as AssetContext);

export const reducer = (state: InitialState, action: Action) => {
  switch (action.type) {
    case "loading-assets": {
      return {
        assets: {},
        isLoadingAssets: true,
      };
    }
    case "end-loading": {
      return {
        ...state,
        isLoadingAssets: false,
      };
    }
    case "set-assets": {
      const { assets } = action.payload;

      return {
        assets,
        isLoadingAssets: false,
      };
    }
  }
}

export const AssetProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(
    () => {
      messageAPI.getAssetsBalance(
        (assets) => {

          dispatch({
            type: "set-assets",
            payload: {
              assets: assets
            },
          });
        }
      )
      dispatch({
        type: "end-loading"
      });
    }, []


  )

  return (
    <AssetContext.Provider
      value={{
        state
      }}
    >
      {children}
    </AssetContext.Provider>
  );
};

export const useAssetContext = () => useContext(AssetContext);
