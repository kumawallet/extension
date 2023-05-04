import { ApiPromise } from "@polkadot/api";
import { BN0 } from "@src/constants/assets";
import {
  formatAmountWithDecimals,
  formatBN,
  formatUSDAmount,
  getAssetUSDPrice,
  getNatitveAssetBalance,
} from "@src/utils/assets";
import { ethers } from "ethers";

describe("assets", () => {
  describe("getNatitveAssetBalance", () => {
    it("should use polkadot api", async () => {
      const api = {
        query: {
          system: {
            account: () => ({
              data: {
                free: 10,
              },
            }),
          },
        },
      } as unknown;

      const result = await getNatitveAssetBalance(api as ApiPromise, "0x123");
      expect(result).toEqual(10);
    });

    it("should use ethereum api", async () => {
      const api = {
        getBalance: vi.fn().mockReturnValue(2),
      } as unknown;

      const result = await getNatitveAssetBalance(
        api as ethers.providers.JsonRpcProvider,
        "0x123"
      );
      expect(result).toEqual(2);
    });

    it("should return same amount", async () => {
      const api = null;
      const result = await getNatitveAssetBalance(api, "0x123");
      expect(result).toEqual(BN0);
    });

    it("should throw error", async () => {
      const api = {
        getBalance: () => {
          throw new Error("error");
        },
      } as unknown;

      const result = await getNatitveAssetBalance(api as ApiPromise, "0x123");
      expect(result).toEqual(BN0);
    });
  });

  it("should format amount with decimals", () => {
    const result = formatAmountWithDecimals(10, 2, 2);
    expect(result).toEqual(0.1);
  });

  it("should format bn", () => {
    const result = formatBN("100", 5);
    expect(result).toEqual("0.001");
  });

  it("should format usd amount", () => {
    const result = formatUSDAmount(10);
    expect(result).toEqual("$10.00");
  });

  describe("get asset USD price", () => {
    it("should return eth price", async () => {
      // mock fetch

      global.fetch = vi.fn().mockReturnValue({
        json: () =>
          Promise.resolve({
            ethereum: {
              usd: 1000,
            },
          }),
      });

      const result = await getAssetUSDPrice("eth");
      expect(result).toEqual(1000);
    });
  });
});
