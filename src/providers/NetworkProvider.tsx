import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { Chain, CHAINS } from "@src/constants/chains";
import Extension from "../Extension";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { useToast } from "../hooks/useToast";
import { ethers } from "ethers";
import { getAccountType } from "../utils/account-utils";
import { useTranslation } from "react-i18next";

interface InitialState {
  chains: typeof CHAINS;
  selectedChain: Chain | null;
  api: ApiPromise | ethers.providers.JsonRpcProvider | null;
  rpc: "";
  init: boolean;
  type: string;
}

const initialState: InitialState = {
  chains: CHAINS,
  selectedChain: null,
  api: null,
  rpc: "",
  init: false,
  type: "",
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

  if (type === "WASM") {
    return ApiPromise.create({ provider: new WsProvider(rpc) });
  }

  return null;
};

const reducer = (state: InitialState, action: any): InitialState => {
  switch (action.type) {
    case "init": {
      const { selectedChain, rpc, api, type } = action.payload;

      return {
        ...state,
        api,
        selectedChain,
        rpc,
        init: true,
        type,
      };
    }
    case "select-network": {
      const { selectedChain, rpc, api, type } = action.payload;

      return {
        ...state,
        selectedChain,
        rpc,
        api,
        type,
      };
    }
    case "set-api": {
      const { api, rpc } = action.payload;

      return {
        ...state,
        rpc: rpc || state.rpc,
        api,
      };
    }
    default:
      return state;
  }
};

export const NetworkProvider: FC<PropsWithChildren> = ({ children }) => {
  const { t: tCommon } = useTranslation("common");
  const { showErrorToast } = useToast();

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      try {
        const selectedNetwork = await Extension.getNetwork();
        let selectedChain = null;
        let rpc = null;
        let api = "";
        let type;

        if (selectedNetwork?.chain?.name) {
          const account = await Extension.getSelectedAccount();
          selectedChain = selectedNetwork?.chain;
          type = getAccountType(account?.type);
          rpc = selectedChain.rpc[type.toLowerCase()];

          // TODO: fix this, show loading while is finish the promise
          // api = getProvider(rpc, accountType);
        }

        dispatch({
          type: "init",
          payload: {
            selectedChain,
            rpc,
            api,
            type,
          },
        });
      } catch (error) {
        showErrorToast(tCommon(error as string));
      }
    })();
  }, []);

  const setSelectNetwork = async (network: Chain) => {
    try {
      if (!network) return;

      await Extension.setNetwork(network);
      const account = await Extension.getSelectedAccount();
      const accountType = getAccountType(account?.type);
      const rpc =
        network.rpc[accountType.toLowerCase() || "wasm"] ||
        network.rpc[accountType.toLowerCase() || "evm"];

      dispatch({
        type: "select-network",
        payload: {
          selectedChain: network,
          rpc,
          type: accountType,
        },
      });
    } catch (error) {
      showErrorToast(tCommon(error as string));
    }
  };

  const getSelectedNetwork = async () => {
    try {
      const { chain: selectedNetwork } = await Extension.getNetwork();

      dispatch({
        type: "select-network",
        payload: selectedNetwork,
      });

      return selectedNetwork;
    } catch (error) {
      showErrorToast(tCommon(error as string));
    }
  };

  //  only for chain with multi support (WASM and EVM)
  const setNewRpc = async (type: string) => {
    try {
      const _type: any = getAccountType(type);

      if (!_type) return;

      const newRpc =
        state.selectedChain?.rpc[_type.toLowerCase() as "wasm" | "evm"];

      const rpcAlreadyInUse = newRpc === state.rpc;

      if (rpcAlreadyInUse) return;

      const api = await getProvider(newRpc, _type);

      dispatch({
        type: "set-api",
        payload: { api, rpc: newRpc },
      });
    } catch (error) {
      showErrorToast(tCommon(error as string));
    }
  };

  useEffect(() => {
    if (state.rpc && state.type) {
      (async () => {
        const api = await getProvider(state.rpc, state.type);
        dispatch({
          type: "set-api",
          payload: {
            api,
          },
        });
      })();
    }
  }, [state.rpc, state.type]);

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
