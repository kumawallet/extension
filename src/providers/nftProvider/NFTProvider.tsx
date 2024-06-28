import {
    createContext,
    FC,
    PropsWithChildren,
    useContext,
    useEffect,
    useReducer,
  } from "react";
  import { Action, InitialState, NFTContext } from "./types.d";
  import { messageAPI } from "@src/messageAPI/api";
  
  const initialState: InitialState = {
    nfts: []
  };
  
  const NFTContext = createContext({} as NFTContext);
  

  export const reducer = (state: InitialState, action: Action): InitialState => {
    switch (action.type) {
      case "update-nfts": {
        const { nfts } = action.payload;
  
        return {
          nfts: nfts
        };
      }
      default:
        return state;
    }
  };
  
  export const NFTProvider: FC<PropsWithChildren> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

  
    useEffect(() => {
      messageAPI.nftsSubscribe((nfts) => {
        dispatch({
          type: "update-nfts",
          payload: {
            nfts: nfts
          }
        });
      });
    }, []);
  
  
    return (
      <NFTContext.Provider
        value={{
          state,
        }}
      >
        {children}
      </NFTContext.Provider>
    );
  };
  
  export const useNFTContext = () => useContext(NFTContext);