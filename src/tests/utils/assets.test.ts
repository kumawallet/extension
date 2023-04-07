import { ApiPromise } from "@polkadot/api";
import {
  formatAmountWithDecimals,
  formatBN,
  formatUSDAmount,
  getNatitveAssetBalance,
} from "@src/utils/assets";
import { ethers } from "ethers";

describe("assets", () => {
  beforeAll(() => {
    vi.mock("ethers");
  });

  describe("getNatitveAssetBalance", () => {
    it("should use polkadot api", async () => {
      const api = {
        query: {
          system: {
            account: vi.fn().mockReturnValue({
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
      const ethers = await import("ethers");
      ethers.ethers.utils.formatEther = vi.fn().mockReturnValue(10);

      const api = {
        getBalance: vi.fn().mockReturnValue(2),
      } as unknown;

      const result = await getNatitveAssetBalance(
        api as ethers.providers.JsonRpcProvider,
        "0x123"
      );
      expect(result).toEqual(2);
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
});
