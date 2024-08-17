import { useEffect, useMemo, useState } from "react";
import {
  useAccountContext,
  useAssetContext,
  useNetworkContext,
} from "@src/providers";
import { decodeAddress } from "@polkadot/util-crypto";
import { formatAmountWithDecimals, formatBN, getType, transformAmountStringToBN } from "@src/utils/assets";
import { useLoading, useToast } from "@src/hooks";
import { captureError } from "@src/utils/error-handling";
import { StealthEX } from "../stealthEX";
import { SUPPORTED_CHAINS_FOR_SWAP, SwapAsset, Swapper } from "../base";
import { useNavigate } from "react-router-dom";
import { BALANCE } from "@src/routes/paths";
import { useTranslation } from "react-i18next";
import { messageAPI } from "@src/messageAPI/api";
import { getAccountType } from "@src/utils/account-utils";
import Account from "@src/storage/entities/Account";
import { Chain, ChainType } from "@src/types";
import { BN } from "@polkadot/util";
import debounce from "lodash.debounce";
export interface TxInfoState {
  bridgeType: string;
  bridgeName: swapType;
  bridgeFee: string;
  gasFee: string | null;
  destinationAddress: string | null;
}

export enum swapType {
  stealhex = "stealHex",
  hydradx = "hydraDx"
}

export interface Tx {
  addressBridge: string;
  addressFrom: string;
  addressTo: string;
  amountBridge: string;
  amountFrom: string;
  amountTo: string;
  chainBridge?: {
    name: string;
    image: string;
  };
  chainFrom: {
    name: string;
    image: string;
  };
  chainTo: {
    name: string;
    image: string;
  };
  assetBridge?: {
    symbol: string;
    image: string;
    decimals: number;
  };
  assetFrom: {
    symbol: string;
    image: string;
    decimals: number;
  };
  assetTo: {
    symbol: string;
    image: string;
    isAproximate: boolean;
  };
  fee: {
    estimatedFee: string;
    estimatedTotal: string;
  };
  swapId: string;
}

export const useSwap = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("swap");
  const [account, setAccount] = useState<Account>();




  const {
    state: { selectedChain, chains },
  } = useNetworkContext();

  const {
    state: { accounts, selectedAccount },
  } = useAccountContext();

  const { state : { assets }} = useAssetContext()



  const { isLoading, starLoading, endLoading } = useLoading();
  const {
    isLoading: isLoadingBuyAsset,
    starLoading: starLoadingBuyAsset,
    endLoading: endLoadingBuyAsset,
  } = useLoading();
  const {
    isLoading: isLoadingSellAsset,
    starLoading: starLoadingSellAsset,
    endLoading: endLoadingSellAsset,
  } = useLoading();
  const {
    isLoading: isCreatingSwap,
    starLoading: starCreatingSwap,
    endLoading: endCreatingSwap,
  } = useLoading();

  const { showErrorToast, showSuccessToast } = useToast();

  const [loadAssetsHydra, setLoadAssetsHydra] = useState(false);
  const [amount , setAmout] = useState<string>("")

  const [assetToSell, setAssetToSell] = useState<Partial<SwapAsset>>({
    label: "",
    balance: new BN("0").toString(),
    decimals: 0,
    symbol: "",
  });
  const [assetsToSell, setAssetsToSell] = useState<SwapAsset[]>([]);

  const [assetToBuy, setAssetToBuy] = useState<Partial<SwapAsset>>({
    label: "",
    balance: new BN("0").toString(),
    decimals: 0,
    symbol: "",
  });
  const [assetsToBuy, setAssetsToBuy] = useState<SwapAsset[]>([]);

  const [recipient, setRecipient] = useState({
    isNotOwnAddress: false,
    address: "",
  });

  const [txInfo, setTxInfo] = useState<TxInfoState>({
    bridgeType: "",
    bridgeName: swapType.hydradx,
    bridgeFee: "",
    gasFee: "0", //modificado
    destinationAddress: null,
  });

  const [tx, setTx] = useState<Tx>({
    addressBridge: "",
    addressFrom: "",
    addressTo: "",
    amountBridge: "",
    amountFrom: "",
    amountTo: "",
    chainBridge: {
      name: "",
      image: "",
    },
    chainFrom: {
      name: "",
      image: "",
    },
    chainTo: {
      name: "",
      image: "",
    },
    assetBridge: {
      symbol: "",
      image: "",
      decimals: 0,
    },
    assetFrom: {
      symbol: "",
      image: "",
      decimals: 0,
    },
    assetTo: {
      symbol: "",
      image: "",
      isAproximate: true,
    },
    fee: {
      estimatedFee: "0",
      estimatedTotal: "0",
    },
    swapId: "",
  });

  const [amounts, setAmounts] = useState({
    sell: "0",
    buy: "0",
  });
 interface TxInfoState {
    bridgeName: swapType;
    bridgeType: string;
    bridgeFee: string;
    gasFee: string;
    destinationAddress: string | null;
    swapInfo?: { 
      idAssetToSell: string;
     idAsseToBuy: string;
      amountSell : string,
      amountBuy: string;
      swaps: any;
      txHex: string;
  }
  }

  interface account {
    address: string,
    type: "wasm" | "evm"
  }
  const [_pairs, setPair] = useState<SwapAsset[]>();

  const [isPairValid, setIsPairValid] = useState(true);

  const [minSellAmount, setMinSellAmount] = useState<string | null>(null);

  const [swapper, setSwapper] = useState<Swapper | null>(null);

  const [mustConfirmTx, setMustConfirmTx] = useState(false);

  const [sellBalanceError, setSellBalanceError] = useState<string | null>(null);

  const [txStealhex, setTxInfoStealHex] = useState({
    bridgeType: "",
    bridgeFee: "",
  });

  

  const init = async (selectedAccount: Account ) => {
   
    try {
      //stealhex
      starLoading();
      const accountType = getAccountType(selectedAccount!.type)?.toLowerCase()
      const firstChainId = Object.keys(selectedChain).find((chainId) => {
        return selectedChain[chainId].type === accountType;
      });

      const allChains = chains.map((chain) => chain.chains).flat();

      if (firstChainId) {
        const chainIds = allChains
          .filter((chain) => chain.type === accountType)
          .map((chain) => chain.id);

        const _swapper = new StealthEX();

        const { nativeAssets, pairs } = await _swapper!.init({
          chainIds: chainIds,
        });
        setPair(pairs)
        setTxInfoStealHex({
          bridgeType: _swapper.type,
          bridgeFee: _swapper.bridgeFee,
        })
        if(accountType === "evm" )
          setLoadAssetsHydra(false);
          setTxInfo((prevState) => ({
            ...prevState,
            bridgeType: _swapper.type,
            bridgeName: swapType.stealhex,
            bridgeFee: _swapper.bridgeFee,
          }));
          //setAssets(nativeAssets);
          setAssetToSell(nativeAssets[0]);
          setAssetsToBuy(pairs);
          setAssetToBuy(pairs[1]);

        

        
        

        
        setAssetsToSell(nativeAssets);
        setSwapper(_swapper);
        
    
    
      }
      if(accountType === "evm"){
        endLoading();
      }
      if(accountType === "wasm" ){
        if(Object.keys(assets[selectedAccount?.key]).includes("hydradx")){
            await messageAPI.initHydraDX();
            setTxInfo((prevState) => ({
                  ...prevState,
                    bridgeType: "Swapper",
                    bridgeName: swapType.hydradx,
                    bridgeFee:  "0.0%",
            }));
            
      
        }
        else{
            
            await messageAPI.setNetwork({id:"hydradx", type: ChainType.WASM, isTestnet: false});
        }

      }
       
    } catch (error) {
      showErrorToast("Error fetching assets");
      captureError(error);
    }
  };
  
  const handleRecipientChange = (label: string, value: unknown) => {
    
    setRecipient((prevState) => ({
      ...prevState,
      [label]: value,
    }));
  };


  const handleAmounts = async (label: "sell" | "buy", value: string) => {
    try {

      if(value !== "0" && tx.addressFrom){
        switch (txInfo.bridgeName) {
          case  swapType.stealhex:{
            setAmounts((prevState) => ({
              ...prevState,
              [label]: value,
            }));
      
            label === "sell" ? starLoadingBuyAsset() : starLoadingSellAsset();
      
            const { estimatedAmount, minAmount } = await swapper!.getEstimatedAmount({
              from: (assetToSell.symbol || "")?.toLowerCase(),
              to: (assetToBuy.symbol || "")?.toLowerCase(),
              amount: value,
            });
            setIsPairValid(estimatedAmount !== "0");
      
            setMinSellAmount(minAmount);
      
            setAmounts((prevState) => ({
              ...prevState,
              [label === "sell" ? "buy" : "sell"]: estimatedAmount,
            }));
      
            label === "sell" ? endLoadingBuyAsset() : endLoadingSellAsset();
          }  
        break;
        case swapType.hydradx :
          {
          setAmounts((prevState) => ({
            ...prevState,
            [label]: value,
          }));

          if(Object.keys(assetToSell).length === 0 && Object.keys(assetToBuy).length === 0) return

          label === "sell" ? starLoadingBuyAsset() : starLoadingSellAsset();
          const info = await handlertxInfoHydradx(assetToSell as SwapAsset,assetToBuy as SwapAsset,value);
          if(!info){
                showErrorToast("Error in handlerTxInfoHydradx")
                return
          }
          setAmounts((prevState) => ({
                ...prevState,
                ["buy"]: String(
                  formatAmountWithDecimals(
                    JSON.parse(
                        info.amountBuy 
                      ),
                      10,
                      assetToBuy.decimals 
                      ))
              }
              ),
              )
              label === "sell" ? endLoadingBuyAsset() : endLoadingSellAsset();
        }
        break;
        default: 
            showErrorToast("Error in handlerAmount")
        break;
      }
     }
    } catch (error) {
      showErrorToast("error_estimating_amount");
    }
  };


  const handleAssetChange = async(label: "sell" | "buy", asset: SwapAsset) => {
    if (label === "sell") {
            starLoading()
            const _asset = assetWithBalance(asset)
            setAssetToSell(_asset);

            if(asset.type === swapType.stealhex){
              const find = assetsToSell.find((asset) => asset.type === swapType.hydradx)
              find && _pairs && setAssetsToBuy(_pairs)

              if (assetToBuy.type !== swapType.stealhex && _pairs) {
                      setAssetToBuy(
                        _pairs.find((a) => a.symbol !== asset.symbol) as SwapAsset
                      );
                    }
              setTxInfo((prevState) => ({
                      ...prevState,
                      bridgeType: txStealhex.bridgeType,
                      bridgeName: swapType.stealhex,
                      bridgeFee: txStealhex.bridgeFee,
              }))

            }
            else{
              
              
                    if(Object.keys(assetToBuy).length === 0 ) return
                    await messageAPI.getAssetsBuy({asset})
                    setTxInfo((prevState) => ({
                      ...prevState,
                        bridgeType: "Swapper",
                        bridgeName: swapType.hydradx,
                        bridgeFee:  "0.0%",
                  }));
                  
                  
            }
            
            endLoading()
      
    } 
    else {

      starLoading()
      setAssetToBuy(asset);
      
      if(asset.type === swapType.stealhex){

          
      if (assetToSell.type !== swapType.stealhex && assetToSell.symbol === asset.symbol || assetToSell.type !== swapType.stealhex) {
        setAssetToSell(
          assetsToSell.find((a) => a.symbol !== asset.symbol && a.type !== swapType.hydradx) as SwapAsset
        );
      }

      }
      endLoading() 
    }
  };

  

  const setMaxAmout = () => {
    try {
      const amount = assetToSell?.balance?.toString();
      const formatedAmount = formatBN(amount || "", assetToSell.decimals);

      setAmounts((prevState) => ({
        ...prevState,
        sell: formatedAmount,
      }));

      handleAmounts("sell", formatedAmount);
    } catch (error) {
      showErrorToast("error_setting_max_amount");
      captureError(error);
    }
  };



  const setSenderAddress = async (address: string) => {
    
    setTx((prevState) => ({
      ...prevState,
      addressFrom: address,
    }));

    const account = accounts.find(
      (account) => account.value!.address === tx.addressFrom
    );
    if (!account) return;
    setAccount(account);
  }


  const swap = async () => {
    starCreatingSwap();
    try {
      if(assetToSell.type === swapType.stealhex){
        const { destination, fee, id } = await swapper!.createSwap({
          currencyFrom: assetToSell.symbol as string,
          currencyDecimals: assetToSell.decimals as number,
          currencyTo: assetToBuy.symbol as string,
          amountFrom: amounts.sell,
          addressFrom: tx.addressFrom,
          addressTo: recipient.address,
          nativeAsset: {
            symbol: assetToSell.label as string,
            decimals: assetToSell.decimals as number,
          },
          assetToSell: {
            symbol: assetToSell.label as string,
            decimals: assetToSell.decimals as number,
          },
        });
  
        const isNeededToConfirmTx = swapper!.mustConfirmTx();
        if (!isNeededToConfirmTx) {
          showSuccessToast("Swap successful");
          return;
        }
  
        const chainId = assetToSell.chainId as string;
  
        const allChains = chains.map((chain) => chain.chains).flat();
  
        const chain = allChains.find((chain) => chain.id === chainId) as Chain;
  
        const updateTx: Tx = {
          swapId: id,
          addressBridge: destination,
          addressFrom: tx.addressFrom,
          addressTo: recipient.address,
          amountFrom: amounts.sell,
          amountTo: amounts.buy,
          amountBridge: amounts.sell,
          chainFrom: {
            name: chain.name,
            image: chain.logo,
          },
          chainBridge: {
            name: chain.name,
            image: chain.logo,
          },
          chainTo: {
            name: "",
            image: assetToBuy.image || "",
          },
          assetFrom: {
            symbol: (assetToSell.label || "").toLocaleUpperCase(),
            image: assetToSell.image || "",
            decimals: assetToSell.decimals || 0,
          },
          assetBridge: {
            symbol: (assetToSell.label || "").toLocaleUpperCase(),
            image: assetToSell.image || "",
            decimals: assetToSell.decimals || 0,
          },
          assetTo: {
            symbol: (assetToBuy.label || "").toLocaleUpperCase(),
            image: assetToBuy.image || "",
            isAproximate: true,
          },
          fee,
        };
        setTx(updateTx);
  
        await messageAPI.updateTx({
          tx: {
            amount: amounts.sell,
            senderAddress: tx.addressFrom,
            destinationAddress: recipient.address,
            originNetwork: chain,
            targetNetwork: chain,
            asset: {
              id: assetToSell.id as string,
              symbol: assetToSell.symbol || "",
              balance: assetToSell.balance || "",
              decimals: assetToSell.decimals || 0,
              address: assetToSell.address || "",
            },
          },
        });
  
        setMustConfirmTx(swapper!.mustConfirmTx());
        // clean amounts
        setMinSellAmount(null);
        setAmounts((prevState) => ({
          ...prevState,
          sell: "0",
          buy: "0",
        }));
      }
      else{
        if(!txInfo.swapInfo?.amountSell) {
          showErrorToast("Error in getTxHex")
          return
        }
        const allChains = chains.map((chain) => chain.chains).flat();
  
        const chain = allChains.find((chain) => chain.id === assetToSell.network) as Chain;
        const updateTx: Tx = {
          swapId: txInfo.swapInfo.txHex as string,
          addressBridge: selectedAccount?.value?.address || tx.addressFrom,
          addressFrom: selectedAccount?.value?.address || tx.addressFrom,
          addressTo:selectedAccount?.value?.address || tx.addressFrom,
          amountFrom:"" ,
          amountTo: amounts.buy,
          amountBridge: amounts.sell,
          chainFrom: {
            name: chain.name as string,
            image: chain.logo as string,
          },
          chainTo: {
            name: chain.name as string,
            image: chain.logo  as string,
          },
          assetFrom: {
            symbol: (assetToSell.symbol || "").toLocaleUpperCase(),
            image: assetToSell.image || "",
            decimals: assetToSell.decimals || 0,
          },
          assetTo: {
            symbol: (assetToBuy.symbol || "").toLocaleUpperCase(),
            image: assetToBuy.image || "",
            isAproximate: true,
          },
          fee: {
            estimatedFee: txInfo.gasFee,
            estimatedTotal: txInfo.gasFee
          },
        };
        setTx(updateTx);
  
        await messageAPI.updateTx({
          tx: {
            amount: amounts.sell,
            senderAddress: tx.addressFrom,
            destinationAddress: tx.addressFrom,
            originNetwork: chain,
            targetNetwork: chain,
            asset: {
              id: assetToSell.id as string,
              symbol: assetToSell.symbol || "",
              balance: assetToSell.balance || "",
              decimals: assetToSell.decimals || 0,
              address: assetToSell.address || "",
            },
            swapInfo: {
                txHex: txInfo.swapInfo.txHex
            }
          },
        });
  
        setMustConfirmTx(swapper!.mustConfirmTx());
        // clean amounts
        setMinSellAmount(null);
        setAmounts((prevState) => ({
          ...prevState,
          sell: "0",
          buy: "0",
        }));
       
          }
    } catch (error) {
      captureError(error);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      showErrorToast(error.response?.data?.message || error?.message || error);
    }

    endCreatingSwap();
  };

  const onBack = () => {
    
    setMustConfirmTx(false);
  };

  const onConfirmTx = async () => {
    if (!swapper) return;
    starLoading();
    try {
      const isConfirmNeeded = swapper.mustConfirmTx();

      if (isConfirmNeeded) {
        await messageAPI.sendTx();

        showSuccessToast(t("tx_send"));
        navigate(BALANCE, {
          state: {
            tab: "activity",
          },
        });
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const _error: any = error;
      showErrorToast(
        _error?.body || _error?.error?.message || _error.message || error
      );
      captureError(error);
    }
    endLoading();
  };

  const isValidWASMAddress = useMemo(() => {
    const { address, isNotOwnAddress } = recipient;

    if (!isNotOwnAddress || !address.trim()) return true;

    try {
      decodeAddress(address);
      return true;
    } catch (error) {
      return false;
    }
  }, [recipient]);

  const balanceIsSufficient = useMemo(() => {
    let isSufficient = false;

    if (assetToSell?.balance) {
      const assetBalance = new BN(assetToSell?.balance.toString() || "0");
      const amountBalance = transformAmountStringToBN(
        amounts.sell,
        assetToSell.decimals || 0
      );

      isSufficient = assetBalance.gte(amountBalance);
      !isSufficient && setSellBalanceError("insufficient_balance");
    }

    if (isSufficient && minSellAmount) {
      isSufficient =
        Number(amounts.sell) < Number(minSellAmount) ? false : true;
      !isSufficient && setSellBalanceError("min_amount_error");
    }

    isSufficient && setSellBalanceError(null);
    return isSufficient;
  }, [assetToSell?.balance, amounts?.sell, minSellAmount]);

  const showRecipientAddress = useMemo(() => {
    return swapper?.showRecipentAddressFormat();
  }, [swapper]);

  const swapInfoMessage = useMemo(() => {
    if (!swapper) return "";

    return swapper.swap_info || "";
  }, [swapper]);

  useEffect(() => {
    if (amounts.buy !== "0") {
      const canChangeSetAssetToSell = swapper!.canChangeSetAssetToSell();
      handleAmounts(
        canChangeSetAssetToSell ? "buy" : "sell",
        canChangeSetAssetToSell ? amounts.buy : amounts.sell
      );
    }
  }, [assetToBuy?.label]);


  const handlertxInfoHydradx = async(assetSell: SwapAsset, assetBuy: SwapAsset, amount: string) => {
    try{
        if(
          assetSell.id && 
          assetBuy.id && amount !== "0" && 
          assetSell.type === swapType.hydradx
        ){
              const data = await messageAPI.getFeeHydra({
                amount:amount, 
                assetToSell:assetSell, 
                assetToBuy:assetBuy, 
                address: selectedAccount?.value?.address ||  tx.addressFrom,
              })

               
              setTxInfo((prevState) => ({
                ...prevState,
                gasFee: String(formatAmountWithDecimals(JSON.parse(data.gasFee),2,assetToBuy.decimals)),
                bridgeType: "protocol",
                bridgeName: swapType.hydradx,
                bridgeFee:  data.bridgeFee,
                swapInfo: data.swapInfo
              }))
              return data.swapInfo
        }
  }
  catch(error){
    showErrorToast(error);
    
  }

  }


  const assetWithBalance = ( asset: Partial<SwapAsset> ) => {
    if(tx.addressFrom){
        const account = accounts.find(
          (account) => account.value!.address === tx.addressFrom
        );
        if (!account) {
          showErrorToast("Error Account");
          return asset
        }
        const key = account.key
        if(!key){
          console.log("Error in selectedAccount")
          return asset
        }
        
        if(asset.network && 
        asset.type === swapType.hydradx &&
        Object.keys(assets[key]).includes(asset.network)){

          const assetInfo = assets[key][asset.network].assets.find((_asset ) => {
              if(_asset.id === asset.id || _asset.symbol === "HDX" && asset.symbol === "HDX" || _asset.symbol == asset.symbol )
                return _asset
          })
          if(!assetInfo){
            showErrorToast("Error in getBalance")
            return asset
          }
          if(asset.symbol === "HDX" && asset.id === "-1"){
              asset.id = "0"
              asset.balance = assetInfo.balance
          return asset
          }
          asset.balance = assetInfo.balance
          return asset 
    }
      return asset
    }
    console.log("Balance error");
    return asset;
    
  }

  useEffect(() => {
    if (!tx.addressFrom) return;

    const account = accounts.find(
      (account) => account.value!.address === tx.addressFrom
    );

    if (!account) return;

    init(account);
  }, [tx.addressFrom, accounts]);


  useEffect(() => {
    if (selectedAccount?.value) {
     
      
      setTx((prevState) => ({
        ...prevState,

        addressFrom: selectedAccount.value!.address,
      }));
    }
  }, [selectedAccount]);

  useEffect(() => {
    messageAPI.networkSubscribe((networks) => {
      if(Object.keys(networks).includes("hydradx")){
        
        debounce((async () => {
          try {
            await messageAPI.initHydraDX();
            setTxInfo((prevState) => ({
                 ...prevState,
                  bridgeType: "Swapper",
                  bridgeName: swapType.hydradx,
                  bridgeFee:  "0.0%",
               }));
          } catch (error) {
            console.error("Error al initHydraDX:", error);
          }
        }), 1000)();
        
      }
    });
    messageAPI.hydraSubscribeToBuy((_assetsToBuy) => {
      setAssetsToBuy(_assetsToBuy);
      setAssetToBuy(_assetsToBuy[0])
      endLoading();
     });

    messageAPI.hydraSubscribeToSell((_assetsToSell) => {
      setAssetsToSell((oldAssetToSell) => [..._assetsToSell,...oldAssetToSell])
      const _asset = assetWithBalance(_assetsToSell[0])
      setAssetToSell(_asset);
    })

  }, [])

  useEffect(
    () => {
      if(assetsToBuy.length > 0  && assetToSell.type && assetsToBuy[0].type === swapType.hydradx && assetToSell.type === swapType.hydradx){

        endLoading()

      }
    }, [assetsToBuy,assetToSell]
  )


  useEffect(() => {
    if(assetToSell && Object.keys(assetToSell).length > 0){
      starLoading()
      const _asset = assetWithBalance(assetToSell);
      setAssetToSell(_asset);
      endLoading();
    }
    

  }, [ assets, assetToSell]);



  return {
    amounts,
    amount,
    setAmout,
    //assets,
    assetsToBuy,
    assetsToSell,
    assetToBuy,
    assetToSell,
    balanceIsSufficient,
    handleAmounts,
    handleAssetChange,
    handleRecipientChange,
    isCreatingSwap,
    isLoading,
    isLoadingBuyAsset,
    isLoadingSellAsset,
    // isLoadingSellPairs,
    loadAssetsHydra,
    handlertxInfoHydradx,
    isValidWASMAddress,
    minSellAmount,
    mustConfirmTx,
    onBack,
    onConfirmTx,
    recipient,
    sellBalanceError,
    setAssetToBuy,
    setAssetToSell,
    setMaxAmout,
    showRecipientAddress,
    swap,
    swapInfoMessage,
    tx,
    txInfo,
    setSenderAddress,
    isPairValid,
  };
};
