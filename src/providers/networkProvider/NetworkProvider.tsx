import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { useTranslation } from "react-i18next";
import { ethers } from "ethers";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { useToast } from "@src/hooks";
import { getAccountType } from "@src/utils/account-utils";
import { Action, InitialState, NetworkContext } from "./types";
import Chains, { Chain } from "@src/storage/entities/Chains";
import { captureError } from "@src/utils/error-handling";
import { messageAPI } from "@src/messageAPI/api";

const initialState: InitialState = {
  chains: {
    mainnets: Chains.getInstance().mainnets,
    testnets: Chains.getInstance().testnets,
    custom: Chains.getInstance().custom,
  },
  selectedChain: null,
  api: null,
  rpc: "",
  init: false,
  type: "",
};

const NetworkContext = createContext({} as NetworkContext);

export const getProvider = async (rpc: string, type: string) => {
  if (type.toLowerCase() === "evm")
    return new ethers.providers.JsonRpcProvider(rpc as string);

  if (type.toLowerCase() === "wasm")
    return ApiPromise.create({ provider: new WsProvider(rpc as string) });
};

export const reducer = (state: InitialState, action: Action): InitialState => {
  switch (action.type) {
    case "init": {
      const { selectedChain, rpc, type, chains } = action.payload;

      return {
        ...state,
        chains,
        selectedChain,
        rpc,
        init: true,
        type,
      };
    }
    case "select-network": {
      const { selectedChain, rpc, type, api } = action.payload;

      if (selectedChain?.name === state.selectedChain?.name) return state

      return {
        ...state,
        selectedChain,
        rpc: rpc || state.rpc,
        type: type || state.type,
        api,
      };
    }
    case "set-api": {
      const { api, type, rpc } = action.payload;

      if (rpc !== state.rpc) return state

      return {
        ...state,
        api: api,
        type: type || state.type,
      };
    }
    case "refresh-networks": {
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

export const NetworkProvider: FC<PropsWithChildren> = ({ children }) => {
  const { t: tCommon } = useTranslation("common");
  const { showErrorToast } = useToast();

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      try {
        const chains = await messageAPI.getAllChains();
        const selectedNetwork = await messageAPI.getNetwork();
        let selectedChain = null;
        let rpc = "";
        let type = "";

        if (selectedNetwork?.chain?.name) {
          const account = await messageAPI.getSelectedAccount();
          selectedChain = selectedNetwork?.chain;
          type = getAccountType(account?.type);
          rpc = selectedChain.rpc[type.toLowerCase() as "evm" | "wasm"] || "";
        }

        dispatch({
          type: "init",
          payload: {
            chains: {
              mainnets: chains.mainnets,
              testnets: chains.testnets,
              custom: chains.custom,
            } as unknown as Chains,
            selectedChain,
            rpc,
            type: type.toUpperCase(),
          },
        });
      } catch (error) {
        captureError(error);
        showErrorToast(tCommon(error as string));
      }
    })();
  }, []);

  const setSelectNetwork = async (network: Chain) => {
    try {
      if (!network) return;
      await messageAPI.setNetwork({ chain: network });
      const account = await messageAPI.getSelectedAccount();
      const accountType = getAccountType(account?.type)?.toLowerCase();
      const rpc =
        network.rpc[accountType.toLowerCase() as "evm" | "wasm"] || "";

      if (state.api && "getBalance" in state.api) {
        (state.api as ethers.providers.JsonRpcProvider).removeAllListeners(
          "block"
        );
      }

      if (state.api && "disconnect" in state.api) await (state.api as ApiPromise).disconnect()

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
      captureError(error);
      showErrorToast(tCommon(error as string));
    }
  };

  const getSelectedNetwork = async () => {
    try {
      const { chain: selectedNetwork } = await messageAPI.getNetwork();

      if (selectedNetwork) {
        dispatch({
          type: "select-network",
          payload: { selectedChain: selectedNetwork },
        });
      }

      return selectedNetwork;
    } catch (error) {
      captureError(error);
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

      if (state.api && "getBalance" in state.api) {
        (state.api as ethers.providers.JsonRpcProvider).removeAllListeners();
      }

      const rpcAlreadyInUse = newRpc === state.rpc;
      if (rpcAlreadyInUse || !newRpc) return;

      if (state.api && "disconnect" in state.api) (state.api as ApiPromise).disconnect()


      dispatch({
        type: "set-api",
        payload: { api: null, rpc: newRpc, type: _type },
      });
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon(error as string));
    }
  };

  const refreshNetworks = async () => {
    try {
      const chains = await messageAPI.getAllChains();
      dispatch({
        type: "refresh-networks",
        payload: { chains },
      });
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon(error as string));
    }
  };

  useEffect(() => {
    if (state.rpc && state.type && !state.api) {
      (async () => {

        const api = await getProvider(state.rpc as string, state.type);

        dispatch({
          type: "set-api",
          payload: {
            api,
            type: state.type,
            rpc: state.rpc as string,
          },
        });
      })();
    }
  }, [state.rpc, state.type, state.api]);

  return (
    <NetworkContext.Provider
      value={{
        state,
        setSelectNetwork,
        getSelectedNetwork,
        setNewRpc,
        refreshNetworks,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = () => useContext(NetworkContext);
