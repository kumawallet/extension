import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react";
import { Chain, CHAINS } from "@src/contants/chains";
import Extension from "../utils/Extension";
import Storage from "@src/utils/storage/Storage";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { useEffect } from "react";

interface InitialState {
  chains: typeof CHAINS;
  selectedChain: Chain | null;
  api: ApiPromise | null;
}

const initialState: InitialState = {
  chains: CHAINS,
  selectedChain: null,
  api: null,
};

const NetworkContext = createContext(
  {} as {
    state: InitialState;
    setSelectNetwork: (network: any) => void;
    getSelectedNetwork: () => Chain;
  }
);

const getApi = (rpc: string) => {
  return ApiPromise.create({ provider: new WsProvider(rpc) });
};

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
    case "set-api": {
      return {
        ...state,
        api: action.payload,
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

  const setNewApi = async (chain: Chain) => {
    const api = await getApi(chain.rpc[0]);
    dispatch({
      type: "set-api",
      payload: api,
    });
  };

  useEffect(() => {
    if (state.selectedChain?.rpc[0]) {
      setNewApi(state.selectedChain);
    }
  }, [state.selectedChain?.name]);

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
