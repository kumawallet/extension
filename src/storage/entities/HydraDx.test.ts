import  HydraDx from "./HydraDx";
import { mockAssets,mockProvider, assetToSell,assetToBuy, mockSwapResult, mockAssetsInit } from "../../tests/mocks/hydradx-mock"
import BigNumber from 'bignumber.js';
import { swapType } from "@src/pages";

describe("HydraDx", () => {
  let hydraDx: HydraDx;
  const fixedTime = Date.now();
  beforeEach(async() => {
    await hydraDx.init(mockProvider);
  });
  
    beforeAll(
      () => {
        vi.spyOn(Date, 'now').mockImplementation(() => fixedTime);
          hydraDx = new HydraDx();
          vi.mock("@galacticcouncil/sdk", async() => {
            const actual = await vi.importActual("@galacticcouncil/sdk")
            return ({
              ...actual,
              TradeRouter: vi.fn().mockImplementation(() => ({
                getAllAssets: vi.fn().mockResolvedValue(mockAssets),
                getAssetPairs: vi.fn().mockResolvedValue(mockAssets),
                getBestSell: vi.fn().mockResolvedValue(mockSwapResult),
              })),
              PoolService: vi.fn(),
            })});
      }
  
    ),
  
    it("should instantiate correctly", () => {
      expect(hydraDx).toBeInstanceOf(HydraDx);
    });
  
    it("should   init, load assets and tradeRouter", async () => {
      expect(hydraDx.tradeRouter).toBeDefined();
      expect(hydraDx.assetsToSell.getValue()).toEqual(mockAssetsInit);
      expect(hydraDx.assetsToBuy.getValue()).toEqual(mockAssetsInit);
    });
  
    it("should return correct fee information", async () => {
  
      const feeInfo = await hydraDx.getFee("50", assetToSell, assetToBuy, 0.1);
  
      expect(feeInfo).toEqual({
        bridgeName: swapType.hydradx,
        bridgeFee:  "0.32",
        gasFee: "10260050718291636551",
        amount: new BigNumber("3245238520245030700720").toString(),
        swapInfo: {
          idAssetToSell: assetToSell.id,
          idAsseToBuy: assetToBuy.id,
          amountSell: "500000000000" ,
          amountBuy: new BigNumber("3245238520245030700720").toString(),
          aliveUntil: fixedTime  + 30000,
          swaps:  [
            {
              poolAddress: '7L53bUTBbfuj14UpdCNPwmgzzHSsrsTWBHX5pys32mVWM3C1',
              pool: 'Omnipool',
              assetIn: '5',
              assetOut: '9',
              assetInDecimals: 10,
              assetOutDecimals: 18,
              amountIn: '500000000000',
              calculatedOut: '3255498570963322337271',
              amountOut: '3245238520245030700720',
              spotPrice: '65120277207769065131',
              tradeFeePct: 0.32,
              tradeFeeRange: [0.3, 5.1],
              priceImpactPct: -0.02,
              errors: [] 
            }
          ],
          slippage: 0.1,
          txHex: "0x123",
          swapError: "",
        },
      })
      
    });
  
    it("should update assetsToBuy", async () => {
  
       await hydraDx.getassetsBuy(assetToSell);
  
      expect(hydraDx.assetsToBuy.getValue()).toEqual(mockAssetsInit);
    });
  
    it("should clear assets and tradeRouter", () => {
  
      hydraDx.ClearAssets();
  
      expect(hydraDx.assetsToBuy.getValue()).toEqual([]);
      expect(hydraDx.assetsToSell.getValue()).toEqual([]);
      expect(hydraDx.tradeRouter).toBeUndefined();
    });
    it("should handle error during init", async () => {
      const brokenProvider = {
        provider: {
          isReady: Promise.reject("Error during provider setup"),
        },
      };
    
      const faultyHydraDx = new HydraDx();
    
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(faultyHydraDx.init(brokenProvider as any)).rejects.toThrow(
        "Error in initHydradx"
      );
    });



});
          

  
  







  




