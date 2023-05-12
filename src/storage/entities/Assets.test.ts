import Assets from "./Assets";

describe("Assets", () => {
  beforeAll(() => {
    vi.mock("@src/storage/entities/BaseEntity", () => {
      class BaseEntityMock {
        static get() {
          return Promise.resolve();
        }

        static set() {
          return Promise.resolve();
        }
      }

      return {
        default: BaseEntityMock,
      };
    });
  });

  it("should instance", () => {
    const assets = new Assets();
    expect(assets).toBeInstanceOf(Assets);
  });

  it("should return default value", () => {
    const assets = new Assets();
    expect(Assets.getDefaultValue()).resolves.toEqual(assets);
  });

  it("should init", () => {
    expect(Assets.init()).resolves.toBeUndefined();
  });

  describe("getByChain", () => {
    it("should get by chain", async () => {
      const _BaseEntityMock = (await import("@src/storage/entities/BaseEntity"))
        .default;
      _BaseEntityMock.get = vi.fn().mockResolvedValue({
        data: {
          ["chain"]: {
            symbol: "symbol",
            address: "address",
            decimals: 18,
          },
        },
      });

      const result = await Assets.getByChain("chain");
      expect(result).toEqual({
        symbol: "symbol",
        address: "address",
        decimals: 18,
      });
    });

    it("should show error", async () => {
      const _BaseEntityMock = (await import("@src/storage/entities/BaseEntity"))
        .default;
      _BaseEntityMock.get = vi.fn().mockReturnValue(undefined);

      try {
        await Assets.getByChain("chain");
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_load_assets");
      }
    });
  });

  describe("addAsset", () => {
    it("should add asset", () => {
      const assets = new Assets();
      const asset = {
        symbol: "symbol",
        address: "address",
        decimals: 18,
      };
      assets.addAsset("chain", asset);
      expect(assets.data).toEqual({ chain: [asset] });
    });

    it("should add new asset in existing chain", () => {
      const assets = new Assets();
      const asset = {
        symbol: "symbol",
        address: "address",
        decimals: 18,
      };

      // mock new asset
      const newAsset = {
        symbol: "symbol2",
        address: "address2",
        decimals: 18,
      };

      assets.addAsset("chain", asset);
      assets.addAsset("chain", newAsset);
      expect(assets.data).toEqual({
        chain: [asset, newAsset],
      });
    });

    it("should throw error when asset already added", () => {
      const assets = new Assets();
      const asset = {
        symbol: "symbol",
        address: "address",
        decimals: 18,
      };
      assets.addAsset("chain", asset);
      expect(() => assets.addAsset("chain", asset)).toThrow(
        "asset_already_added"
      );
    });
  });
});
