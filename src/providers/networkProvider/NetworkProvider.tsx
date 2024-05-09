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
import { Action, InitialState, NetworkContext} from "./types";
import { captureError } from "@src/utils/error-handling";
import { messageAPI } from "@src/messageAPI/api";
import { Chain, ChainsState } from "@src/types";
import { SettingKey, SettingType } from "@src/storage/entities/settings/types";
import { SUBTRATE_CHAINS, EVM_CHAINS } from "@src/constants/chainsData";
import { migrateOldCustomChains } from "@src/utils/chains";


const initialState: InitialState = {
  chains: [],
  selectedChain: {},
  api: {},
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

    let customChains = await messageAPI.getCustomChains();

    if (customChains.length > 0) {
      const customChainsToMigrate = customChains.filter((chain) => !chain.id);

      if (customChainsToMigrate.length > 0) {
        const { newChains } = await migrateOldCustomChains(customChainsToMigrate)
        if (newChains.length > 0) {
          customChains = newChains
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
    default:
      return state;
  }
};



export const getProviderforNetworks = async(networks: Chain[], api :any) =>{

  const provider : { [id:string] :  ApiPromise | ethers.providers.JsonRpcProvider | null} = {};


  const promises: Promise<any>[] = [];


  if((Object.keys(api).length === 0) || !api){
    networks.forEach((network) => {
      if (network.type === "evm")
        {
          provider[network.id] = new ethers.providers.JsonRpcProvider(network.rpcs[0] as string);
        }
      if (network.type === "wasm")
        {
          const promise= ApiPromise.create({ provider: new WsProvider(network.rpcs)})
          promises.push(promise);
          promise.then((api) => {
          provider[network.id] = api})
  
        }
      })

    await Promise.all(promises)
    return provider
  }
  else{
    networks.forEach((network : Chain) => {
      
      if(Object.keys(api).includes(network.id)){
        provider[network.id] = api[network.id];
      }
      else {
        if (network.type === "evm")
          {
            provider[network.id] = new ethers.providers.JsonRpcProvider(network.rpcs[0] as string);
          }
        if (network.type === "wasm")
          {
            const promise= ApiPromise.create({ provider: new WsProvider(network.rpcs)})
            promises.push(promise);
            promise.then((api) => {provider[network.id] = api})
    
          }
      }
    })
    
    await Promise.all(promises)
    return provider
  }
}





export const NetworkProvider: FC<PropsWithChildren> = ({ children }) => {
  const { t: tCommon } = useTranslation("common");
  const { showErrorToast } = useToast();
  const [state, dispatch] = useReducer(reducer, initialState);




  const initializeNetwork = async () => {
    try{

      const [chains, selectedChainFromStorage] = await Promise.all(
        [getChains(),
        messageAPI.getNetwork()
        ]);

      let selectedChain = {}
  

      const allChains = chains.map((chain) => chain.chains).flat();

      // TODO: migrate this to background
      // @ts-expect-error --- To handle old chain format
     if(selectedChainFromStorage.Chain){
        if (selectedChainFromStorage?.chain?.supportedAccounts) {
          const newChainFormat = allChains.find((chain) => selectedChainFromStorage?.chain?.name  === chain.name);
          if (newChainFormat) {
            const id=newChainFormat.id;
            const type= newChainFormat.type
            const isTestnet = newChainFormat.isTestnet
           selectedChain = await messageAPI.setNetwork({id,isTestnet,type})
          }
          else {
            const id= allChains[0].id
            const type = allChains[0].type
            const isTestnet = allChains[0].isTestnet
            selectedChain = await messageAPI.setNetwork({id,isTestnet,type})
          }
      }
     }
     if(Object.keys(selectedChainFromStorage.SelectedChain).length > 0){
      selectedChain = selectedChainFromStorage.SelectedChain
     }
     else{
      const id= allChains[0].id
      const type = allChains[0].type
      const isTestnet = allChains[0].isTestnet
      selectedChain = await messageAPI.setNetwork({id,isTestnet,type});
     }
      dispatch({
        type: "init",
        payload: {
          chains,
          selectedChain,
        },
      });
     }catch (error) {
      captureError(error);
      showErrorToast(tCommon(error as string));
    }
  }; 

  const updateSelectNetwork = async (id: string, type: "wasm" | "evm" | "ol",isTestnet?: boolean) => {
    try {
      if(Object.prototype.hasOwnProperty.call(state.selectedChain, id)){
        await messageAPI.deleteSelectChain({id});
        if (state.api[id] && "getBalance" in state.api[id]) {
              (state.api[id] as ethers.providers.JsonRpcProvider).removeAllListeners("block");
        }
        if (state.api[id] && "disconnect" in state.api[id])
              await (state.api[id] as ApiPromise).disconnect()

      }
      else{
        await messageAPI.setNetwork({ id, isTestnet,type });
      }
     
     

     
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


    messageAPI.networkSubscribe(
      (network)=>{
        dispatch({
          type: "select-network",
          payload: {
            selectedChain: network
          },
        });
      }
    )
  }, []);

  useEffect(() => {
    if (Object.keys(state.selectedChain).length === 0) return
    const allChains = state.chains.map((chain) => chain.chains).flat();
    const setProvider = async () => {
      try {
        const Chains = allChains.filter((chain) => Object.keys(state.selectedChain).includes(chain.id))
        const provider = await getProviderforNetworks(Chains, state.api);
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
        updateSelectNetwork,
        refreshNetworks,
        initializeNetwork,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = () => useContext(NetworkContext);
