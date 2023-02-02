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
import { useToast } from "../hooks/useToast";

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

interface NetworkContext {
  state: InitialState;
  setSelectNetwork: (network: Chain) => void;
  getSelectedNetwork: () => Promise<Chain | undefined>;
}

const NetworkContext = createContext({} as NetworkContext);

const getApi = (rpc: string) => {
  return ApiPromise.create({ provider: new WsProvider(rpc) });
};

const reducer = (state: InitialState, action: any): InitialState => {
  switch (action.type) {
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
  const { showErrorToast } = useToast();

  const [state, dispatch] = useReducer(reducer, initialState);

  const setSelectNetwork = async (network: Chain) => {
    try {
      await Extension.setNetwork(network);

      dispatch({
        type: "select-network",
        payload: network,
      });
    } catch (error) {
      showErrorToast(error);
    }
  };

  const getSelectedNetwork = async () => {
    try {
      const { chain: selectedNetwork } =
        await Storage.getInstance().getNetwork();
      dispatch({
        type: "select-network",
        payload: selectedNetwork,
      });

      return selectedNetwork;
    } catch (error) {
      showErrorToast(error);
    }
  };

  const setNewApi = async (chain: Chain) => {
    try {
      const api = await getApi(chain.rpc[0]);
      dispatch({
        type: "set-api",
        payload: api,
      });
    } catch (error) {
      showErrorToast(error);
    }
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
