import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { useAccountContext, useNetworkContext } from "@src/providers";
import {
  formatAmountWithDecimals,
  getAssetUSDPrice,
  getNatitveAssetBalance,
  getSubtrateNativeBalance,
  getWasmAssets,
} from "@src/utils/assets";
import { ApiPromise } from "@polkadot/api";
import { Contract, ethers } from "ethers";
import AccountEntity from "@src/storage/entities/Account";
import { BN } from "@polkadot/util";
import erc20Abi from "@src/constants/erc20.abi.json";
import {
  BN0,
} from "@src/constants/assets";
import { Action, Asset, AssetContext, InitialState, LoadAssetParams, SelectedChain } from "./types";
import { API, Chain, IAsset } from "@src/types";
import { captureError } from "@src/utils/error-handling";
import { messageAPI } from "@src/messageAPI/api";
import { Api } from "../networkProvider/types";

export const initialState: InitialState = {
  assets: {},
  isLoadingAssets: true,
};

const AssetContext = createContext({} as AssetContext);

const getType = (type: string) =>{
  if(type === "imported_wasm"){
    return type.slice(-4);
  }
  else if( type === "imported_evm"){
    return type.slice(-3);
  }
  else if(type === "evm" || type === "wasm"){
    return type
  }
}

export const reducer = (state: InitialState, action: Action) => {
  switch (action.type) {
    case "loading-assets": {
      return {
        assets: {},
        isLoadingAssets: true,
      };
    }
    case "end-loading": {
      return {
        ...state,
        isLoadingAssets: false,
      };
    }
    case "set-assets": {
      const { assets } = action.payload;

      return {
        assets,
        isLoadingAssets: false,
      };
    }
    case "update-assets": {
      const { assets } = action.payload;
      return {
        ...state,
        assets,
      };
    }
    case "update-one-asset": {
      const {
        asset: {
          balance = BN0,
          frozen = BN0,
          reserved = BN0,
          transferable = BN0,
          updatedBy,
          updatedByValue,
        }, networkId
      } = action.payload;
      const _assets = state.assets;
      if(Object.keys(state.assets).length === 0) return state;
      
      const index = _assets[networkId].findIndex(
        (asset) => asset[updatedBy] === updatedByValue
      );
      
      if (index > -1 && !balance?.eq(_assets[networkId][index].balance)) {
        const _balance = Number(
          formatAmountWithDecimals(Number(balance), 6, _assets[networkId][index]?.decimals)
        );
        _assets[networkId][index] = {
          ..._assets[networkId][index],
          amount: Number(((_assets[networkId][index].price || 0) * _balance).toFixed(2)),
          balance,
          frozen,
          reserved,
          transferable,
        };

        return {
          isLoadingAssets: true,
          assets:_assets,
        };
      }
      else{
        
      return {
        ...state,
      };

      }
    }
    case "update-one-network-assets": {
      const {
       network,
       assets
      } = action.payload;
      const _assets = state.assets;

      _assets[network] = assets
      return{
        ...state,
        assets: _assets
      }
    }
  }
};

export const AssetProvider: FC<PropsWithChildren> = ({ children }) => {
  const {
    state: { api, selectedChain ,chains},
  } = useNetworkContext();
  
  const {
    state: { selectedAccount },
  } = useAccountContext();

  const [state, dispatch] = useReducer(reducer, initialState);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [copyApi, setCopyApi] = useState<Api>({})
  const [unsubscribers, setUnsubscribers] = useState<{[id: string] : any[]}>({});
  const allChains = chains.map((chain) => chain.chains).flat();
  const loadAssets = async ({
    api,
    selectedAccount,
    selectedChain,
  }: LoadAssetParams) => {
    if (Object.keys(api).length  === 0 || Object.keys(selectedChain).length  === 0) return

    dispatch({
      type: "loading-assets",
    });
    const type = Object.keys(selectedChain).filter(chain => selectedChain[chain].type === getType(selectedAccount?.type?.toLowerCase()));



    if (type.length === 0 ) {
      dispatch({
        type: "set-assets",
        payload: {
          assets: {},
        }
      })

      dispatch({
        type: "end-loading",
      });
      return;
    }
    setCopyApi(api)
    const assets: {[id: string] :Asset[]} = {};
    try {
      dispatch({
        type: "loading-assets",
      });
      const{ nativeBalance , _unsubs } = await getNativeAsset(api, selectedAccount, selectedChain)
      const _assets =  await getOtherAssets(
          api,
          selectedAccount,
          selectedChain,
          _unsubs
        )
      
      

      Object.keys(nativeBalance).forEach((chain) => {
        const _chain = allChains.find((_chain) => _chain.id === chain)
        assets[chain] = [
          {
            id: "-1",
            symbol: _chain?.symbol,
            decimals: _chain?.decimals,
            ...nativeBalance[chain],
          },
          ..._assets[chain].map((asset: any) => ({
            ...asset
          })) as  Asset[]
        ];
        
      })
      const newAssets = await getAssetsUSDPrice(assets);
      dispatch({
        type: "set-assets",
        payload: {
          assets: newAssets,
        },
      });
      dispatch({
        type: "end-loading",
      });
    } catch (error) {
      captureError(error);
      dispatch({
        type: "end-loading",
      });
    } 
    // 
    
    return assets; 
  };

  const getNativeAsset : any = async (
    api: API,
    account: AccountEntity,
    selectedChain: SelectedChain
  ) => {
    const address = account.value.address;
    const amounts : any = {};
    let _unsubs : any = {}
    const promises: any = Object.keys(selectedChain).map((chain : any) =>  getNatitveAssetBalance(api[chain], address,account).then((result:any) =>amounts[chain]= result));
    promises.push(getUnsubscribers(api,account,selectedChain).then((result) => _unsubs = result))
    await Promise.all(promises)
    const nativeBalance= amounts
    
    return  { nativeBalance, _unsubs};
    




  };



  const getUnsubscribers = async(
    api: API,
    account: AccountEntity,
    selectedChain: SelectedChain) => {
       // suscribers for native asset balance update 
    const address = account.value.address;
    const subs: any = {...unsubscribers}
    const promisesUnsub : any  = Object.keys(selectedChain).map((chain) => {
      if (selectedChain[chain].type === "wasm" && getType(account.type.toLowerCase()) === "wasm") {
        return (api[chain] as ApiPromise).query.system.account(
          address,
          ({
            data,
          }: {
            data: {
              free: string;
              reserved: string;
              miscFrozen?: string;
              frozen?: string;
              feeFrozen?: string;
            };
          }) => {
            const { transferable, reserved, balance, frozen } =
              getSubtrateNativeBalance(data);
  
            dispatch({
              type: "update-one-asset",
              payload: {
                asset: {
                  updatedBy: "id",
                  updatedByValue: "-1",
                  balance,
                  transferable,
                  reserved,
                  frozen,
                },
                networkId: chain,
              },
            });
            dispatch({
              type: "end-loading",
            });
          }
        ).then((result : any) => {
          if(subs[chain] && subs[chain].length > 0){
            subs[chain].push(result);
        }
        else if(!subs[chain]){
          subs[chain] = [result]
        }
        })
      } else if(selectedChain[chain].type === "evm" && getType(account.type.toLowerCase()) === "evm"){
        const _api = api[chain] as ethers.providers.JsonRpcProvider;
         _api.off("block");
        _api.on("block", () => {
          _api.getBalance(account.value.address).then((balance: any) => { 
            dispatch({
              type: "update-one-asset",
              payload: {
                asset: {
                  updatedBy: "id",
                  updatedByValue: "-1",
                  balance,
                },
                networkId: chain,
              },
            });
            dispatch({
              type: "end-loading",
            });
          })
        });
      }
      else if(selectedChain[chain].type === "wasm"){
        subs[chain] = null;
      }
    })
    await Promise.all(promisesUnsub);
    return subs

  }

  const getOtherAssets = async (
    _api: API,
    account: AccountEntity,
    _selectedChain: SelectedChain,
    unsubs: any) => {
    const allChains = chains.map((chain) => chain.chains).flat();
    const otherAssets : any = {}
    
    const subs : any = unsubs;
    const promises = Object.keys(_selectedChain).map((chain) => {
      if (_selectedChain[chain]!.type === "wasm" && getType(account.type.toLowerCase()) === "wasm") {
          return getWasmAssets(
            api[chain],
            chain,
            account?.value?.address,
            (
              assetId: string,
              amounts: {
                balance: BN;
                frozen: BN;
                reserved: BN;
                transferable: BN;
              }
            ) => {
              dispatch({
                type: "update-one-asset",
                payload: {
                  asset: {
                    updatedBy: "id",
                    updatedByValue: assetId,
                    balance: amounts.balance,
                    frozen: amounts.frozen,
                    reserved: amounts.reserved,
                    transferable: amounts.transferable,
                  },
                  networkId: chain,
                },
              });
            }
          ).then(({ assets, unsubs }) => {
            otherAssets[chain] = assets || [];
            const existingSubs = subs[chain];
            if(( existingSubs && Array.isArray(existingSubs))){
              subs[chain].push(...unsubs);
            }
            else{
              subs[chain] = [unsubs]
            }
        })
      } else if(_selectedChain[chain]!.type === "evm" && getType(account.type.toLowerCase()) === "evm") {
        const chainS = allChains.find((_chain) => _chain.id === chain)
        return loadAssetsFromStorage(chainS!,account).then((assets) => otherAssets[chain] = assets);
      }
      else{
        otherAssets[chain] = [];
      }

    })
    await Promise.all(promises)
    setUnsubscribers(subs);
    return otherAssets
  };

  const loadAssetsFromStorage = async (chain: Chain, account: AccountEntity) => {
    try {
      const assetsFromStorage = await messageAPI.getAssetsByChain(
        {
          chain: chain.id
        }
      );
      const assets: IAsset[] = [];

      if (assetsFromStorage.length > 0 && account?.value?.address) {
        const accountAddress = account.value.address;

        await Promise.all(
          assetsFromStorage.map(async (asset, index) => {
            assets[index] = {
              address: asset.address,
              balance: "",
              id: String(index),
              decimals: asset.decimals,
              symbol: asset.symbol,
            };

            try {
              if (chain.type === "evm") {
                const contract = new Contract(
                  asset.address,
                  erc20Abi,
                  api[chain.id]
                );


                const balance = await contract.balanceOf(accountAddress);


                assets[index].balance = balance;

                contract.removeAllListeners("Transfer");

                contract.on("Transfer", async (from, to) => {
                  const selfAddress = selectedAccount?.value?.address;
                  if (from === selfAddress || to === selfAddress) {
                    const balance = await contract.balanceOf(accountAddress);
                    dispatch({
                      type: "update-one-asset",
                      payload: {
                        asset: {
                          updatedBy: "id",
                          updatedByValue: assets[index].id,
                          balance,
                        },
                        networkId: chain.id
                      },
                    });
                  }
                });
              } 
              // else {
              //   const gasLimit = api[chain.id].registry.createType("WeightV2", {
              //     refTime: REF_TIME,
              //     proofSize: PROOF_SIZE,
              //   });

              //   const contract = new ContractPromise(
              //     api[chain.id],
              //     metadata,
              //     asset.address
              //   );

              //   const { output } = await contract.query.balanceOf(
              //     accountAddress,
              //     {
              //       gasLimit,
              //     },
              //     accountAddress
              //   );
              //   assets[index].balance = new BN(output?.toString() || "0");
              //   assets[index].contract = contract;
              // }
            } catch (error) {
              captureError(error);
              assets[index].balance = new BN("0");
            }
          })
        );
      }

      return assets;
    } catch (error) {
      return [];
    }
  };

  const removeListeners = () => {
    
    if (Object.keys(unsubscribers).length > 0) {
      Object.keys(copyApi).forEach((chain) => {
        const _chain : any = allChains.find((_chain) => _chain.id === chain)
        if(_chain && _chain.type === "evm" && getType(selectedAccount.type) === "evm") 
         {
          copyApi[chain].off("block")
        }
        setUnsubscribers({});
    })
  }
  }
  const getAssetsUSDPrice = async (_assets: any) => {
    try {
      const allAssets :any = {};
      for (const key in _assets) {
        const assetsArray = _assets[key];
        if(!selectedChain[key].isTestnet){
          const symbols = assetsArray.map((chain: any) => chain.symbol);
          allAssets[key] = symbols;
        }
        
      }
      const prices : any = {}
      await Promise.all(
        Object.keys(allAssets).map((chain) => getAssetUSDPrice(allAssets[chain]).then((result: any) => prices[chain] = result
          )
      )
    )
    for (const key in _assets) {
      _assets[key].forEach((asset: any) => {
        if (prices[key] && prices[key][asset.symbol] ) {
          asset.price = prices[key][asset.symbol] || 0;
          asset.amount = Number((prices[key][asset.symbol].toFixed(5) * formatAmountWithDecimals(
            Number(asset.balance),
            6,
            asset.decimals
          )).toFixed(2)) || 0;
        }
      });
    }
    return _assets
    } catch (error) {
      captureError(error);
    }
  };

  // const listWasmContracts = async (assets: IAsset[]) => {
  //   const unsub = await (api as ApiPromise).rpc.chain.subscribeNewHeads(
  //     async () => {
  //       const gasLimit = api.registry.createType("WeightV2", {
  //         refTime: REF_TIME,
  //         proofSize: PROOF_SIZE,
  //       });

  //       for (const asset of assets) {
  //         const { output } = await (
  //           asset.contract as ContractPromise
  //         ).query.balanceOf(
  //           selectedAccount?.value?.address,
  //           {
  //             gasLimit,
  //           },
  //           selectedAccount.value?.address
  //         );
  //         const balance = new BN(output?.toString() || "0");

  //         dispatch({
  //           type: "update-one-asset",
  //           payload: {
  //             asset: {
  //               updatedBy: "address",
  //               updatedByValue: asset.address as string,
  //               balance,
  //             },
  //           },
  //         });
  //       }
  //     }
  //   );

  //   setUnsubscribers((state) => [...state, unsub]);
  // };


  
  useEffect(() =>{
      removeListeners()
      if (
        selectedAccount &&
        api &&
        selectedChain
      ) {
          loadAssets({
            api,
            selectedAccount,
            selectedChain
          });
        }

    }, [selectedAccount.key]
  )


  useEffect(() => {
    const assets: any = {}
    const unsubs = unsubscribers;
    if (
      selectedAccount &&
      api &&
      selectedChain) {
       // Copy API
       
      if( Object.keys(state.assets).length === 0){
        loadAssets({
          api,
          selectedAccount,
          selectedChain
        });
      }
      else{
        Object.keys(state.assets).forEach((chain : string) => {
          if(Object.keys(api).includes(chain)){
            assets[chain] = state.assets[chain];
          }
          else{
            const _chain = allChains.find((_chain) => _chain.id === chain)
            if ( _chain && _chain.type === "evm" )
              {
                copyApi[chain].off("block")
              }
            if ( _chain && _chain.type === "wasm")
              {
                
                delete unsubs[chain];
              }
          }
        }
      )   
      setUnsubscribers(unsubs);
      const set = Object.keys(api).filter((chain:string) => !Object.keys(state.assets).includes(chain))
      const newSelectdChain: any = {}
      const newApi : any = {}
      set.forEach((chain) => {
        newSelectdChain[chain] = selectedChain[chain]
        newApi[chain] = api[chain]

      })
      if(set.length > 0){
      dispatch({
        type: "loading-assets",
      });
        const updateAssets = async(chain: string, unsubs : any) => {
          
        

        const {nativeBalance, _unsubs} = await getNativeAsset(newApi, selectedAccount,newSelectdChain)
        unsubs[chain] = _unsubs;
        const newAssets = await getOtherAssets(
            newApi,
            selectedAccount,
            newSelectdChain,
            _unsubs
          )
        
        Object.keys(nativeBalance).forEach((chain) => {
          const _chain = allChains.find((_chain) => _chain.id === chain)
          assets[chain] = [
            {
              id: "-1",
              symbol: _chain?.symbol,
              decimals: _chain?.decimals,
              ...nativeBalance[chain],
            }
          ];
          newAssets[chain].forEach((asset: any) => {
            assets[chain].push(asset);
          })
          
      })
      const _assets = await getAssetsUSDPrice(assets);
      setCopyApi(api)
      dispatch({
        type: "update-assets",
        payload: {
          assets: _assets,
        },
      });
      dispatch({
        type: "end-loading",
      });
      return unsubs
      }
      
      const a: any = updateAssets(set[0], unsubs)
      setUnsubscribers(a);
      }
      else {
        setCopyApi(api)
        dispatch({
          type: "update-assets",
          payload: {
            assets: assets,
          },
        });
        dispatch({
          type: "end-loading",
        });
      }
      }
      
      
    }
  }, [api]);


  return (
    <AssetContext.Provider
      value={{
        state,
        loadAssets,
      }}
    >
      {children}
    </AssetContext.Provider>
  );
};
export const useAssetContext = () => useContext(AssetContext);
