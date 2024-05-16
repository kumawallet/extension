import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@src/hooks";
import { Action, InitialState, NetworkContext } from "./types";
import { captureError } from "@src/utils/error-handling";
import { messageAPI } from "@src/messageAPI/api";
import { ChainsState } from "@src/types";
import { SettingKey, SettingType } from "@src/storage/entities/settings/types";
import { SUBTRATE_CHAINS, EVM_CHAINS } from "@src/constants/chainsData";
import { migrateOldCustomChains } from "@src/utils/chains";
import { OL_CHAINS } from "@src/constants/chainsData/ol";

const initialState: InitialState = {
  chains: [],
  selectedChain: {}
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
      {
        title: "move",
        chains: OL_CHAINS
      }
    ];

    let customChains = await messageAPI.getCustomChains();

    if (customChains.length > 0) {
      const customChainsToMigrate = customChains.filter((chain) => !chain.id);

      if (customChainsToMigrate.length > 0) {
        const { newChains } = await migrateOldCustomChains(
          customChainsToMigrate
        );
        if (newChains.length > 0) {
          customChains = newChains;
        }
      }

      chains.push({
        title: "custom",
        chains: customChains,
      });
    }

    if (showTesnets) {
      chains.push(
        ...[
          {
            title: "wasm_based_testnets",
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

export const reducer = (state: InitialState, action: Action): InitialState => {
  switch (action.type) {
    case "select-network": {
      const { selectedChain } = action.payload;

      if (selectedChain === state.selectedChain) return state;
      return {
        ...state,
        selectedChain,
      };
    }

    case "refresh-networks": {
      const { chains } = action.payload;
      return {
        ...state,
        chains,
      };
    }
    case "init-networks": {
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
    getChains().then((result) => {
      dispatch({
        type: "init-networks",
        payload: {
          chains: result
        },
      });
    })


    messageAPI.networkSubscribe(
      (network) => {
        dispatch({
          type: "select-network",
          payload: {
            selectedChain: network
          },
        });
      }
    )
  }, []);

  return (
    <NetworkContext.Provider
      value={{
        state,
        refreshNetworks,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = () => useContext(NetworkContext);
