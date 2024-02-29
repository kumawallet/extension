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
import { Action, InitialState, NetworkContext } from "./types";
import { captureError } from "@src/utils/error-handling";
import { messageAPI } from "@src/messageAPI/api";
import { Chain, ChainsState } from "@src/types";
import { SettingKey, SettingType } from "@src/storage/entities/settings/types";
import { SUBTRATE_CHAINS, EVM_CHAINS } from "@src/constants/chainsData";

const initialState: InitialState = {
  chains: [],
  selectedChain: null,
  api: null,
  init: false,
};

const NetworkContext = createContext({} as NetworkContext);

const getChains = async (): Promise<ChainsState> => {
  try {
    const setting = await messageAPI.getSetting({
      type: SettingType.GENERAL,
      key: SettingKey.SHOW_TESTNETS,
    });

    const showTesnets = setting?.value || (false as boolean);

    const chains: ChainsState = [
      {
        title: "wasm_based",
        chains: SUBTRATE_CHAINS.filter((chain) => !chain.isTestnet),
      },
      {
        title: "evm_based",
        chains: EVM_CHAINS.filter((chain) => !chain.isTestnet),
      },
    ];

    // TODO: conditional for customs

    const customChains = await messageAPI.getCustomChains();


    if (customChains.length > 0) {
      chains.push({
        title: "custom",
        // @ts-expect-error --- To handle old chain format
        chains: customChains,
      });
    }

    if (showTesnets) {
      chains.push(
        ...[
          {
            title: "wasm_baed_testnets",
            chains: SUBTRATE_CHAINS.filter((chain) => chain.isTestnet),
          },
          {
            title: "EVM testnets",
            chains: EVM_CHAINS.filter((chain) => chain.isTestnet),
          },
        ]
      );
    }

    return chains;
  } catch (error) {
    return [];
  }
};

export const getProvider = async (rpcs: string[], type: "wasm" | "evm") => {
  if (type.toLowerCase() === "evm")
    return new ethers.providers.JsonRpcProvider(rpcs[0] as string);

  if (type.toLowerCase() === "wasm")
    return ApiPromise.create({ provider: new WsProvider(rpcs) });
};

export const reducer = (state: InitialState, action: Action): InitialState => {
  switch (action.type) {
    case "init": {
      const { selectedChain, chains } = action.payload;

      return {
        ...state,
        chains,
        selectedChain,
        init: true,
      };
    }
    case "set-api": {
      const { api } = action.payload;

      return {
        ...state,
        api,
      };
    }

    case "select-network": {
      const { selectedChain, api } = action.payload;

      if (selectedChain?.name === state.selectedChain?.name) return state;

      return {
        ...state,
        selectedChain,
        api,
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

  const initializeNetwork = async () => {
    try {

      const [chains, selectedChainFromStorage] = await Promise.all(
        [getChains(),
        messageAPI.getNetwork()
        ]);

      const allChains = chains.map((chain) => chain.chains).flat();

      // TODO: migrate this to background
      if (selectedChainFromStorage?.chain?.supportedAccounts) {
        const newChainFormat = allChains.find((chain) =>
          selectedChainFromStorage.chain?.name === chain.name
        );

        if (newChainFormat) {
          // @ts-expect-error --- To handle old chain format
          await messageAPI.setNetwork({ chain: newChainFormat });
        }
      }

      // @ts-expect-error --- To handle old chain format
      if (!selectedChainFromStorage?.chain?.id) {
        // @ts-expect-error --- To handle old chain format
        await messageAPI.setNetwork({ chain: allChains[0] });
      }

      // @ts-expect-error --- To handle old chain format
      const selectedChain = selectedChainFromStorage?.chain?.id ? selectedChainFromStorage.chain as Chain : allChains[0];

      dispatch({
        type: "init",
        payload: {
          chains,
          selectedChain,
          rpc: "",
          type: "",
        },
      });
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon(error as string));
    }
  };

  const setSelectNetwork = async (chain: Chain) => {
    try {

      // @ts-expect-error --- To handle old chain format
      await messageAPI.setNetwork({ chain });

      if (state.api && "getBalance" in state.api) {
        (state.api as ethers.providers.JsonRpcProvider).removeAllListeners(
          "block"
        );
      }
      if (state.api && "disconnect" in state.api)
        await (state.api as ApiPromise).disconnect();


      dispatch({
        type: "select-network",
        payload: {
          selectedChain: chain,
          rpc: "",
          type: "",
          api: null,
        },
      });
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon(error as string));
    }
  };

  const refreshNetworks = async () => {
    try {
      const chains = await getChains();
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
    (async () => {
      const isInit = await messageAPI.alreadySignedUp();
      if (isInit) {
        initializeNetwork();
      }
    })();
  }, []);

  useEffect(() => {
    if (!state.selectedChain) return

    const setProvider = async () => {
      try {
        const rpcs = state.selectedChain!.rpcs;
        const type = state.selectedChain!.type;

        const provider = await getProvider(
          rpcs,
          type as "wasm" | "evm"
        );

        dispatch({
          type: "set-api",
          payload: { api: provider },
        });
      } catch (error) {
        captureError(error);
        showErrorToast(tCommon(error as string));
      }
    }

    setProvider()

  }, [state.selectedChain])

  return (
    <NetworkContext.Provider
      value={{
        state,
        setSelectNetwork,
        refreshNetworks,
        initializeNetwork,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = () => useContext(NetworkContext);
