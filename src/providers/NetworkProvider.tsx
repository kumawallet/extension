import { useEffect } from "react";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react";
import { Chain, CHAINS } from "@src/contants/chains";
import { Network } from "@src/utils/storage/entities/Network";
import Extension from "../utils/Extension";
import Storage from "@src/utils/storage/Storage";

interface InitialState {
  chains: typeof CHAINS;
  selectedChain: Chain | null;
}

const initialState: InitialState = {
  chains: CHAINS,
  selectedChain: null,
};

const NetworkContext = createContext(
  {} as {
    state: InitialState;
    setSelectNetwork: (network: any) => void;
    getSelectedNetwork: () => Chain;
  }
);

const reducer = (state: InitialState, action: any): InitialState => {
  switch (action.type) {
    case "init": {
      return {
        ...state,
      };
    }
    case "select-network": {
      return {
        ...state,
        selectedChain: action.payload,
      };
    }
    default:
      return state;
  }
};

export const NetworkProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setSelectNetwork = async (network: Chain) => {
    await Extension.setNetwork(network);

    dispatch({
      type: "select-network",
      payload: network,
    });
  };

  const getSelectedNetwork = async () => {
    const selectedNetwork = await Storage.getInstance().getNetwork();

    dispatch({
      type: "select-network",
      payload: selectedNetwork?.chain,
    });

    return selectedNetwork?.chain;
  };

  return (
    <NetworkContext.Provider
      value={{
        state,
        setSelectNetwork,
        getSelectedNetwork,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = () => useContext(NetworkContext);
