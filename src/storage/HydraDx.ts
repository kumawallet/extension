import { ApiPromise } from "@polkadot/api";
import { BehaviorSubject } from "rxjs";
import { SwapAsset } from "@src/pages/swap/base";
import AccountEntity from "@src/storage/entities/Account";
import { BalanceClient, PoolService, PoolType, TradeRouter } from "@galacticcouncil/sdk";
import { BigNumber } from "bignumber.js"

export type NetworkStatus = Record<string, string>;

export enum ChainStatus {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
}

export class HydraDx {
    public assetsToBuy = new BehaviorSubject< SwapAsset[] | [] >([])
    public assetsToSell =  new BehaviorSubject< SwapAsset[] | [] >([])
    tradeRouter: TradeRouter | undefined
    constructor() {
        this.tradeRouter = undefined
      }

    public async init ( provider: ApiPromise, account: AccountEntity) {
      await provider.isReady
      const poolService = new PoolService(provider);
      await poolService.syncRegistry();
      const balanceClient = new BalanceClient(provider)
      const _tradeRouter = new TradeRouter(poolService, {
        includeOnly: [PoolType.Omni]
      });
      const result = await _tradeRouter.getAllAssets()
     this.tradeRouter = _tradeRouter;

      const assets = result && await Promise.all (result.map(async(_asset) => {
        if(account.value){
          const balance = await balanceClient.getBalance(
                  account.value.address,
                  _asset.id
                ) 
                  return {
                    id: _asset.id,
                    symbol: _asset.symbol as string,
                    label: _asset.name,
                    image: _asset.symbol as string,
                    balance : String(Number (balance)),
                    decimals: Number(_asset.decimals),
                    network: "hydradx" as string,
                    name: _asset.name as string,
                    chainId: _asset.id as string
                  
                }
        } 
      }
    )) || []
    const filteredAssets: SwapAsset[] = assets.filter(Boolean) as SwapAsset[];
    let a: any = []
    if(filteredAssets.length > 0 ){
      a = await _tradeRouter.getAssetPairs(filteredAssets[0].id)
      this.assetsToSell.next(filteredAssets)
      this.assetsToBuy.next(a);
    } 
    }

    public async getFee ( amount: number, assetToSell: SwapAsset, assetToBuy: SwapAsset /*, provider: ApiPromise, account : string*/) {
        try{
            const parsedFromAmount =  new BigNumber(amount).shiftedBy(-1 * assetToSell.decimals).toString();
            const _sellResult = await this.tradeRouter?.getBestSell(assetToSell.id, assetToBuy.id, parsedFromAmount)
            const result = _sellResult?.toHuman()
            const toAmount = result.amountOut;
            const minReceive = toAmount.times(1 - 0.04).integerValue();
            const txHex = result.toTx(minReceive).hex;
            /*const extrinsic = provider.tx(txHex)
            const paymentInfo = await extrinsic.paymentInfo(account);
            const networkFee = {
                tokenSlug: assetToSell.id,
                amount: paymentInfo.partialFee.toString(),
                feeType: "network"
              };
        
            const tradeFee = _sellResult ? {
                token: assetToSell.id, // fee is subtracted from receiving amount
                amount: _sellResult.tradeFee.toString(),
                feeType: "hydradx"
              } : undefined;
              console.log(networkFee, tradeFee)*/
        }
        catch(error){
            console.log("Error in getfee Hydradx", error)
        }

    }
    
}
