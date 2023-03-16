import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { useTranslation } from "react-i18next";
import { Chain, CHAINS } from "@src/constants/chains";
import Extension from "@src/Extension";
import { ethers } from "ethers";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { useToast } from "@src/hooks";
import { getAccountType } from "@src/utils/account-utils";
import { Action, InitialState, NetworkContext } from "./types";

const initialState: InitialState = {
  chains: CHAINS,
  selectedChain: null,
  api: null,
  rpc: "",
  init: false,
  type: "",
};

const NetworkContext = createContext({} as NetworkContext);

const getProvider = (rpc: string, type: string) => {
  if (type.toLowerCase() === "evm")
    return new ethers.providers.JsonRpcProvider(rpc as string);

  if (type.toLowerCase() === "wasm")
    return ApiPromise.create({ provider: new WsProvider(rpc as string) });
};

export const reducer = (state: InitialState, action: Action): InitialState => {
  switch (action.type) {
    case "init": {
      const { selectedChain, rpc, type } = action.payload;

      return {
        ...state,
        selectedChain,
        rpc,
        init: true,
        type,
      };
    }
    case "select-network": {
      const { selectedChain, rpc, type, api } = action.payload;

      return {
        ...state,
        selectedChain,
        rpc: rpc || state.rpc,
        type: type || state.type,
        api,
      };
    }
    case "set-api": {
      const { api, rpc, type } = action.payload;

      return {
        ...state,
        rpc: rpc || state.rpc,
        api: api,
        type: type || state.type,
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
        let rpc = "";
        let type = "";

        if (selectedNetwork?.chain?.name) {
          const account = await Extension.getSelectedAccount();
          selectedChain = selectedNetwork?.chain;
          type = getAccountType(account?.type);
          rpc = selectedChain.rpc[type.toLowerCase() as "evm" | "wasm"] || "";
        }

        dispatch({
          type: "init",
          payload: {
            selectedChain,
            rpc,
            type: type.toUpperCase(),
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
      const accountType = getAccountType(account?.type)?.toLowerCase();
      const rpc =
        network.rpc[accountType.toLowerCase() as "evm" | "wasm"] || "";

      dispatch({
        type: "select-network",
        payload: {
          selectedChain: network,
          rpc,
          type: accountType.toUpperCase(),
          api: null,
        },
      });
    } catch (error) {
      showErrorToast(tCommon(error as string));
    }
  };

  const getSelectedNetwork = async () => {
    try {
      const { chain: selectedNetwork } = await Extension.getNetwork();

      if (selectedNetwork) {
        dispatch({
          type: "select-network",
          payload: { selectedChain: selectedNetwork },
        });
      }

      return selectedNetwork;
    } catch (error) {
      showErrorToast(tCommon(error as string));
    }
  };

  //  only for chain with multi support (WASM and EVM)
  const setNewRpc = async (type: string) => {
    try {
      const _type = getAccountType(type);

      if (!_type) return;

      const newRpc =
        state.selectedChain?.rpc[_type.toLowerCase() as "wasm" | "evm"] || "";

      const rpcAlreadyInUse = newRpc === state.rpc;
      if (rpcAlreadyInUse || !newRpc) return;

      dispatch({
        type: "set-api",
        payload: { api: null, rpc: newRpc, type: _type },
      });
    } catch (error) {
      showErrorToast(tCommon(error as string));
    }
  };

  useEffect(() => {
    if (state.rpc && state.type) {
      (async () => {
        const api = await getProvider(state.rpc as string, state.type);
        dispatch({
          type: "set-api",
          payload: {
            api,
            type: state.type,
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
