import { ApiPromise } from "@polkadot/api";
import { getNatitveAssetBalance } from "@src/utils/assets";
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

      const result = await getNatitveAssetBalance(
        api as ApiPromise,
        "0x123",
        2
      );
      expect(result).toEqual(0.1);
    });

    it("should use ethereum api", async () => {
      const ethers = await import("ethers");
      ethers.ethers.utils.formatEther = vi.fn().mockReturnValue(10);

      const api = {
        getBalance: vi.fn().mockReturnValue(2),
      } as unknown;

      const result = await getNatitveAssetBalance(
        api as ethers.providers.JsonRpcProvider,
        "0x123",
        2
      );
      expect(result).toEqual(10);
    });
  });
});
