import { ApiPromise } from "@polkadot/api";
import { BN0 } from "@src/constants/assets";
import {
  formatAmountWithDecimals,
  formatBN,
  formatUSDAmount,
  getAssetUSDPrice,
  getNatitveAssetBalance,
  getWasmAssets,
} from "@src/utils/assets";
import { ethers } from "ethers";

describe("assets", () => {
  beforeAll(() => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          eth: {
            usd: 1000,
          },
        }),
    });
  });

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
      const api = {} as unknown;
      const result = await getNatitveAssetBalance(api as null, "0x123");
      expect(result).toEqual(BN0);
    });

    it("should return same amount", async () => {
      const result = await getNatitveAssetBalance(null, "0x123");
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

      const result = await getAssetUSDPrice("eth");
      expect(result).toEqual(1000);
    });

    it("should return 0", async () => {
      // mock fetch
      const result = await getAssetUSDPrice("moonbeam");
      expect(result).toEqual(0);
    });

    it("should throw error", async () => {
      // mock fetch
      global.fetch = vi.fn().mockRejectedValue(new Error("error"));

      const result = await getAssetUSDPrice("eth");
      expect(result).toEqual(0);
    });
  });

  describe("getWasmAssets", () => {
    it("get assets", async () => {
      const ASSETS_MOCK = [
        [
          {
            args: [
              {
                id: 100,
              },
            ],
          },
          {
            toJSON: () => ({
              name: "0x476c696d6d6572",
              symbol: "0x474c4d52",
              decimals: 18,
            }),
          },
        ],
      ];

      const apiMock = {
        query: {
          assets: {
            metadata: {
              entries: () => ASSETS_MOCK,
            },
            account: (
              assetId: unknown,
              address: unknown,
              cb: (data: unknown) => void
            ) => {
              cb({
                toJSON: () => ({
                  balance: 10,
                }),
              });
            },
          },
        },
      } as unknown;
      const CHAIN_NAME = "Astar";
      const ADDRESS = "Yk1P3zKpYzkx5Ppvfs9PmE1KoqdfVshvzE2f7GTeT6uEmg5";
      const dispatchMock = vi.fn();

      const result = await getWasmAssets(
        apiMock as ApiPromise,
        CHAIN_NAME,
        ADDRESS,
        dispatchMock
      );

      expect(result.assets[0]).toContain({
        id: "100",
        name: "Glimmer",
        symbol: "GLMR",
        decimals: 18,
        balance: BN0,
        aditionalData: null,
      });
    });

    it("get assets Astar case", async () => {
      const ASSETS_MOCK = [
        [
          {
            args: [
              {
                toString: () => "100",
                toJSON: () => ({
                  nativeAssetId: {
                    token: "ACA",
                  },
                  foreignAssetId: 2,
                  stableAssetId: 1,
                }),
              },
            ],
          },
          {
            toJSON: () => ({
              name: "0x476c696d6d6572",
              symbol: "0x474c4d52",
              decimals: 18,
            }),
          },
        ],
      ];

      const apiMock = {
        query: {
          assetRegistry: {
            assetMetadatas: {
              entries: () => ASSETS_MOCK,
            },
          },
          tokens: {
            accounts: (
              address: unknown,
              assetId: unknown,
              cb: (data: unknown) => void
            ) => {
              cb({
                toJSON: () => ({
                  free: 10,
                }),
              });
            },
          },
        },
      } as unknown;
      const CHAIN_NAME = "Acala";
      const ADDRESS = "23gJg1hLk1NPjNR9TLGGHGZ8ZEZ6wR2JsgzgjXUxxj5Le5WZ";
      const dispatchMock = vi.fn();

      const result = await getWasmAssets(
        apiMock as ApiPromise,
        CHAIN_NAME,
        ADDRESS,
        dispatchMock
      );

      expect(result.assets[0]).toMatchObject({
        id: "100",
        name: "Glimmer",
        symbol: "GLMR",
        decimals: 18,
        balance: BN0,
        aditionalData: {
          tokenId: {
            StableAssetPoolToken: 1,
          },
        },
      });
    });
  });
});
