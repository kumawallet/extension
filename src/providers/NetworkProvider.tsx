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
import { useToast } from "../hooks/useToast";
import { ethers } from "ethers";
import { getAccountType } from "../utils/account-utils";

interface InitialState {
  chains: typeof CHAINS;
  selectedChain: Chain | null;
  api: ApiPromise | ethers.providers.JsonRpcProvider | null;
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
  setNewRpc: (rpc: string) => void;
}

const NetworkContext = createContext({} as NetworkContext);

const getProvider = (rpc: string | undefined, type: "EVM" | "WASM") => {
  if (!rpc) return null;

  if (type === "EVM") {
    return new ethers.providers.JsonRpcProvider(rpc);
  }

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

  const setNewRpc = async (type: string) => {
    try {
      const _type: any = getAccountType(type);

      const rpc =
        state.selectedChain?.rpc[_type.toLowerCase() as "wasm" | "evm"];

      const api = await getProvider(rpc, _type);

      dispatch({
        type: "set-api",
        payload: api,
      });
    } catch (error) {
      showErrorToast(error);
    }
  };

  return (
    <NetworkContext.Provider
      value={{
        state,
        setSelectNetwork,
        getSelectedNetwork,
        setNewRpc,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = () => useContext(NetworkContext);
