import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react";
import { Chain, CHAINS } from "@src/contants/chains";
import Extension from "../Extension";
import Storage from "@src/storage/Storage";
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

const getApi = (rpc: string | undefined) => {
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

  const setNewApi = async (rpc: string | undefined) => {
    try {
      const api = await getApi(rpc);
      dispatch({
        type: "set-api",
        payload: api,
      });
    } catch (error) {
      showErrorToast(error);
    }
  };

  useEffect(() => {
    if (state.selectedChain?.name) {
      const isWasm = state.selectedChain.supportedAccounts[0]?.includes("WASM");

      const rpc = state.selectedChain.rpc[isWasm ? "wasm" : "evm"];

      setNewApi(rpc);
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
