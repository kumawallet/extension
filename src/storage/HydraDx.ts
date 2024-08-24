import { ApiPromise } from "@polkadot/api";
import { BehaviorSubject } from "rxjs";
import { SwapAsset } from "@src/pages/swap/base";
import { PoolError,Swap, PoolService,  TradeRouter,  } from "@galacticcouncil/sdk";
import {  swapType } from "@src/pages";
import { api } from "./entities/Provider";
import { ASSETS_ICONS } from "../constants/assets-icons";

export type NetworkStatus = Record<string, string>;

export enum ChainStatus {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
}


export enum SwapErrorType {
  ERROR_FETCHING_QUOTE = 'ERROR_FETCHING_QUOTE',
  NOT_MEET_MIN_SWAP = 'NOT_MEET_MIN_SWAP',
  UNKNOWN = 'UNKNOWN',
  ASSET_NOT_SUPPORTED = 'ASSET_NOT_SUPPORTED',
  QUOTE_TIMEOUT = 'QUOTE_TIMEOUT',
  INVALID_RECIPIENT = 'INVALID_RECIPIENT',
  SWAP_EXCEED_ALLOWANCE = 'SWAP_EXCEED_ALLOWANCE',
  SWAP_NOT_ENOUGH_BALANCE = 'SWAP_NOT_ENOUGH_BALANCE',
  NOT_ENOUGH_LIQUIDITY = 'NOT_ENOUGH_LIQUIDITY',
  MAKE_POOL_NOT_ENOUGH_EXISTENTIAL_DEPOSIT = 'MAKE_POOL_NOT_ENOUGH_EXISTENTIAL_DEPOSIT',
  AMOUNT_CANNOT_BE_ZERO = 'AMOUNT_CANNOT_BE_ZERO',
}
const SWAPTS_ASSETS = ["0","5", "9","16", "100", "20", "101", "1000099", "1000100"];
export class HydraDx {
    assetsToBuy = new BehaviorSubject< SwapAsset[] | [] >([])
    assetsToSell =  new BehaviorSubject< SwapAsset[] | [] >([])
    tradeRouter: TradeRouter | undefined;

    constructor() {
        this.tradeRouter = undefined
      }

    public async init ( provider: api) {
      await (provider.provider as ApiPromise).isReady
      const poolService = new PoolService(provider.provider as ApiPromise);
      const tradeRouter = new TradeRouter(poolService);
      this.tradeRouter = tradeRouter;
      const assets = await tradeRouter.getAllAssets()
    const assetsToSell : SwapAsset[]= []

    SWAPTS_ASSETS.forEach((asset) => {
      const find = assets.find((_asset) => _asset.id === asset);
      if(find){
        const _assetToSell = {
          id: find.id,
          symbol: find.symbol as string,
          label: find.symbol,
          image: ASSETS_ICONS[find.symbol === "4-Pool" ? "FOURPOOL": find.symbol === "2-Pool" ? "TWOPOOL": find.symbol],
          balance : "0",
          decimals: Number(find.decimals),
          network: "hydradx" as string,
          name: find.name as string,
          chainId: find.id as string,
          type: swapType.hydradx
        
      }
        assetsToSell.push(_assetToSell);
      }
      
    })

    const _assetsBuy = await tradeRouter.getAssetPairs(assetsToSell[0].chainId);

     const assetsBuy : SwapAsset[] = []

     SWAPTS_ASSETS.forEach((assetBuy) => {
        const find = _assetsBuy.find((_asset) => _asset.id === assetBuy);
        if(find){
          const _assetBuy = {
            id: find.id,
            symbol: find.symbol as string,
            label: find.symbol,
            image: ASSETS_ICONS[find.symbol === "4-Pool" ? "FOURPOOL": find.symbol === "2-Pool" ? "TWOPOOL": find.symbol],
            balance : "0",
            decimals: Number(find.decimals),
            network: "hydradx" as string,
            name: find.name as string,
            chainId: find.id as string,
            type: swapType.hydradx
          
        }
          assetsBuy.push(_assetBuy)
        }
      })

    this.assetsToSell.next(assetsToSell);
    this.assetsToBuy.next(assetsBuy);
    }

    public async getFee ( amount: string, assetToSell: SwapAsset, assetToBuy: SwapAsset) {
        try{
            const _sellResult = await this.tradeRouter?.getBestSell(assetToSell.id, assetToBuy.id,amount);
            
            if(!_sellResult){
              throw new Error("Error in _sellResult")
            }
            
             const minReceive = _sellResult?.amountOut.times(1 - 0.001).integerValue();
             const txHex = _sellResult.toTx(minReceive).hex;

            const  swapRouter = this.getSwapPathErrors(_sellResult.swaps);
            let swapError = ""
            if(swapRouter.length > 0){
              const defaultError = swapRouter[0];
              switch (defaultError) {
                case PoolError.InsufficientTradingAmount:
                  swapError = SwapErrorType.SWAP_NOT_ENOUGH_BALANCE;
                  break;
                case PoolError.TradeNotAllowed:
                  swapError = SwapErrorType.ERROR_FETCHING_QUOTE;
                  break;
                case PoolError.MaxInRatioExceeded:
                  swapError = SwapErrorType.NOT_ENOUGH_LIQUIDITY;
                  break;
                case PoolError.UnknownError:
                  swapError = SwapErrorType.ERROR_FETCHING_QUOTE;
                  break;
                case PoolError.MaxOutRatioExceeded:
                  swapError = SwapErrorType.NOT_ENOUGH_LIQUIDITY;
              }
            }
            return {
              bridgeName: swapType.hydradx,
              bridgeFee: _sellResult.tradeFeePct.toString(),
              gasFee: _sellResult.tradeFee.toString(),
              amount: _sellResult.amountOut.toString(),
              swapInfo: {
                idAssetToSell: assetToSell.id,
                idAsseToBuy: assetToBuy.id,
                amountSell : _sellResult.amountIn.toString(),
                amountBuy: _sellResult.amountOut.toString(),
                swaps:  _sellResult.swaps,
                txHex: txHex,
                swapError : swapError
              },
            }
        }
        catch(error){
            console.log("Error in getfee Hydradx", error)
            throw error;
        }


    }
    
    public async getassetsBuy (asset: SwapAsset){
      try{
        this.assetsToBuy.next([]);
        const assets = await this.tradeRouter?.getAssetPairs(asset.chainId) || [];
        const assetsBuy : SwapAsset[] = []
        assets.forEach((assetBuy) => {
              const find = SWAPTS_ASSETS.find((_asset) => _asset === assetBuy.id);
              if(find){
                const _assetBuy = {
                  id: assetBuy.id,
                  symbol: assetBuy.symbol as string,
                  label: assetBuy.symbol,
                  image: ASSETS_ICONS[assetBuy.symbol === "4-Pool" ? "FOURPOOL": assetBuy.symbol === "2-Pool" ? "TWOPOOL": assetBuy.symbol],
                  balance : "0",
                  decimals: Number(assetBuy.decimals),
                  network: "hydradx" as string,
                  name: assetBuy.name as string,
                  chainId: assetBuy.id as string,
                  type: swapType.hydradx
                
              }
                assetsBuy.push(_assetBuy)
              }
        })
        this.assetsToBuy.next(assetsBuy);
      }
      catch(error){
        console.log(error)
        throw error
      }

    }
    private getSwapPathErrors (swapList: Swap[]): PoolError[] {
      return swapList.reduce((prev, current) => {
        return [
          ...prev,
          ...current.errors
        ];
      }, [] as PoolError[]);
    }

    public ClearAssets (){
      this.assetsToBuy.next([]);
      this.assetsToSell.next([]);
      this.tradeRouter = undefined;
    }
}
