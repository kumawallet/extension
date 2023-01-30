import { useEffect } from "react";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react";
import { Chain, CHAINS } from "@src/contants/chains";

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
    selectNetwork: (network: any) => void;
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

  useEffect(() => {
    (async () => {
      // local selectedNetwork
    })();
  }, []);

  const selectNetwork = (network: Chain) => {
    dispatch({
      type: "select-network",
      payload: network,
    });
  };

  const getSelectedNetwork = () => {
    const selectedNetwork: Chain = state.chains[0].chains[0];

    // TODO: get selecteNetowork from settings

    selectNetwork(selectedNetwork);

    return selectedNetwork;
  };

  return (
    <NetworkContext.Provider
      value={{
        state,
        selectNetwork,
        getSelectedNetwork,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = () => useContext(NetworkContext);
