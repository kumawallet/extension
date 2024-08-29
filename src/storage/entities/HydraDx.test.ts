import { HydraDx } from "./HydraDx";
import { mockAssets,mockProvider, assetToSell,assetToBuy, mockBestSell,mockSwapResult, mockAssetsInit,mockBestSellError } from "../../tests/mocks/hydradx-mock"








describe("HydraDx", () => {
  let hydraDx: HydraDx;
  beforeAll(
    () => {
        hydraDx = new HydraDx();
        vi.mock("@galacticcouncil/sdk", () => ({
            TradeRouter: vi.fn().mockImplementation(() => ({
              getAllAssets: vi.fn().mockResolvedValue(mockAssets),
              getAssetPairs: vi.fn().mockResolvedValue(mockAssets),
              getBestSell: vi.fn().mockRejectedValue(mockBestSell),
            })),
            PoolService: vi.fn(),
          }));

    }

  )

  beforeEach(async() => {
    await hydraDx.init(mockProvider);
  });

  it("should instantiate correctly", () => {
    expect(hydraDx).toBeInstanceOf(HydraDx);
  });

  it("should  load assets and tradeRouter", async () => {
    expect(hydraDx.tradeRouter).toBeDefined();
    expect(hydraDx.assetsToSell.getValue()).toEqual(mockAssetsInit);
    expect(hydraDx.assetsToBuy.getValue()).toEqual(mockAssetsInit);
  });

  it("should return correct fee information", async () => {

    const feeInfo = await hydraDx.getFee("50", assetToSell, assetToBuy, 0.1);

    expect(feeInfo).toEqual(mockSwapResult)
    
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

//   it("should handle errors in getFee method", async () => {

//     await expect(hydraDx.getFee("100", assetToSell, assetToBuy, 0.01)).rejects.toThrow("Mock error");
//   });

//   it("should handle errors in getassetsBuy method", async () => {

//     await expect(hydraDx.getassetsBuy(assetToSell)).rejects.toThrow("Error in getAssetsToBuy");
//   });
});