import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { Action, InitialState, assetsBuyContext } from "./types";
import { ASSETS_TRANSAK } from "../../constants/assets-transak";
import { transformAddress } from "@src/utils/account-utils";

const initialState: InitialState = {
  chains: [],
};

export const reducer = (state: InitialState, action: Action): InitialState => {
  switch (action.type) {
    case "init-chains": {
      const { chains } = action.payload;
      return {
        ...state,
        chains,
      };
    }
    default:
      return state;
  }
};
const BuyContext = createContext({} as assetsBuyContext);

export const BuyProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const createOrder = (symbol: string, address: string, network: string) => {
    return new Promise<string>((resolve) => {
      const prefix = state.chains.find(
        (chain) => chain.symbol === symbol && chain.network === network
      )?.prefix;
      const params = {
        apiKey: import.meta.env.VITE_TRANSAK_API_KEY,
        defaultCryptoCurrency: symbol,
        networks: network,
        cryptoCurrencyList: symbol,
        walletAddress: transformAddress(address, prefix),
      };
      const query = new URLSearchParams(params).toString();
      resolve(`${import.meta.env.VITE_TRANSAK_URL}?${query}`);
    });
  };

  useEffect(() => {
    dispatch({
      type: "init-chains",
      payload: {
        chains: ASSETS_TRANSAK,
      },
    });
  }, []);

  return (
    <BuyContext.Provider
      value={{
        state,
        createOrder,
      }}
    >
      {children}
    </BuyContext.Provider>
  );
};

export const useBuyContext = () => useContext(BuyContext);
