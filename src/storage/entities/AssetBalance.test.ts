import { ApiPromise } from "@polkadot/api";
import { Asset, ChainType, SubstrateBalance } from "@src/types";
import AssetsBalance from "./AssetBalance";
import { providers } from "ethers";
import { OlProvider } from "@src/services/ol/OlProvider";
import {
  EVM_ACCOUNT_MOCK,
  OL_ACCOUNT_MOCK,
  POLKADOT_ACCOUNT_MOCK,
} from "@src/tests/mocks/account-mocks";

const BALANCE_MOCK = "1000000000000000000";

const NATIVE_BALANCE_POLKADOT_MOCK = {
  data: {
    free: BALANCE_MOCK,
    reserved: "0",
    miscFrozen: "0",
    feeFrozen: "0",
  },
};

const POLKADOT_PROVIDER_MOCK = {
  query: {
    system: {
      account: (_: string, cb?: (data: SubstrateBalance) => void) => {
        if (cb) {
          cb(NATIVE_BALANCE_POLKADOT_MOCK);
          return Promise.resolve(() => {});
        }

        return Promise.resolve(NATIVE_BALANCE_POLKADOT_MOCK);
      },
    },
  },
};

const ETHERS_PROVIDER_MOCK = {
  off: () => {},
  on: (_: string, cb: () => void) => {
    cb();
  },
  getBalance: () => {
    return Promise.resolve(BALANCE_MOCK);
  },
};

const OL_PROVIDER_MOCK = {
  onNewBlock: (cb: () => void) => {
    cb();
  },
  getBalance: () => {
    return Promise.resolve(BALANCE_MOCK);
  },
};

const NATIVE_WASM_ASSETS_MOCK: Partial<Asset>[] = [
  {
    id: "-1",
    symbol: "ASTR",
    amount: "0.10",
    balance: BALANCE_MOCK,
    decimals: 18,
    transferable: "0",
    price: "0",
  },
];

const NON_NATIVE_WASM_ASSETS_MOCK: Partial<Asset>[] = [
  {
    id: "-1",
    symbol: "USDT",
    amount: "0.10",
    balance: BALANCE_MOCK,
    decimals: 6,
    transferable: "0",
    price: "0.1",
  },
];

const NATIVE_EVM_ASSETS_MOCK: Partial<Asset>[] = [
  {
    id: "-1",
    symbol: "ETH",
    amount: "0",
    balance: BALANCE_MOCK,
    decimals: 18,
    transferable: "0",
    price: "0",
  },
];

const NON_NATIVE_EVM_ASSETS_MOCK: Partial<Asset>[] = [
  {
    id: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    symbol: "USDT",
    amount: "0",
    balance: BALANCE_MOCK,
    decimals: 6,
    price: "0",
  },
];

const NATIVE_OL_ASSETS_MOCK: Partial<Asset>[] = [
  {
    id: "-1",
    symbol: "OL",
    amount: "0",
    balance: BALANCE_MOCK,
    decimals: 6,
    transferable: "0",
    price: "0",
  },
];

const nativeAssetsHoisted = vi.hoisted(() => ({
  getNativeAssetBalance: vi.fn(),
}));

describe("AssetsBalance", () => {
  beforeAll(() => {
    vi.mock("@src/utils/assets", async () => {
      const actual = await import("@src/utils/assets");
      return {
        ...actual,
        getNativeAssetBalance: nativeAssetsHoisted.getNativeAssetBalance,
        getAssetUSDPrice: () => ({
          DOT: 7.3,
          ASTR: 0.1,
          USDT: 1,
        }),
        getWasmAssets: (
          _: ApiPromise,
          __: string,
          ___: string,
          cb: () => void
        ) => {
          cb();

          return {
            assets: NON_NATIVE_WASM_ASSETS_MOCK,
            unsubs: [],
          };
        },
      };
    });

    vi.mock("ethers", async () => {
      const actual = await import("ethers");
      return {
        ...actual,
        Contract: class {
          balanceOf() {
            return Promise.resolve(BALANCE_MOCK);
          }

          removeAllListeners() {}

          on(_: string, cb: () => void) {
            cb();
          }
        },
      };
    });

    vi.mock("@src/storage/entities/Assets", () => ({
      default: {
        getByChain: () => [
          {
            address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            decimals: 6,
            symbol: "USDT",
          },
        ],
      },
    }));
  });

  describe("setAssets", () => {
    it("should load polkadot assets", async () => {
      nativeAssetsHoisted.getNativeAssetBalance.mockReturnValue(
        NATIVE_WASM_ASSETS_MOCK[0]
      );
      const assetBalance = new AssetsBalance();
      await assetBalance.setAssets(
        POLKADOT_ACCOUNT_MOCK,
        {
          provider: POLKADOT_PROVIDER_MOCK as unknown as ApiPromise,
          type: ChainType.WASM,
        },
        "astar"
      );
      const assets =
        assetBalance._assets[POLKADOT_ACCOUNT_MOCK.key]["astar"].assets;
      expect(assets[0]).toEqual({
        ...NATIVE_WASM_ASSETS_MOCK[0],
        price: "0.1",
      });
      expect(assets[1]).toEqual(NON_NATIVE_WASM_ASSETS_MOCK[0]);
    });

    it("should load evm assets", async () => {
      nativeAssetsHoisted.getNativeAssetBalance.mockReturnValue(
        NATIVE_EVM_ASSETS_MOCK[0]
      );
      const assetBalance = new AssetsBalance();
      await assetBalance.setAssets(
        EVM_ACCOUNT_MOCK,
        {
          provider:
            ETHERS_PROVIDER_MOCK as unknown as providers.JsonRpcProvider,
          type: ChainType.EVM,
        },
        "ethereum"
      );
      const assets =
        assetBalance._assets[EVM_ACCOUNT_MOCK.key]["ethereum"].assets;

      expect(assets[0]).toEqual({ ...NATIVE_EVM_ASSETS_MOCK[0] });
      expect(assets[1]).toMatchObject({
        ...NON_NATIVE_EVM_ASSETS_MOCK[0],
        price: "1",
        amount: "1000000000000.00",
      });
    });

    it("should load ol assets", async () => {
      nativeAssetsHoisted.getNativeAssetBalance.mockReturnValue(
        NATIVE_OL_ASSETS_MOCK[0]
      );

      const assetBalance = new AssetsBalance();
      await assetBalance.setAssets(
        OL_ACCOUNT_MOCK,
        {
          provider: OL_PROVIDER_MOCK as unknown as OlProvider,
          type: ChainType.OL,
        },
        "ol"
      );

      const assets = assetBalance._assets[OL_ACCOUNT_MOCK.key]["ol"].assets;

      expect(assets[0]).toEqual(NATIVE_OL_ASSETS_MOCK[0]);
    });
  });

  it("reset", async () => {
    const assetBalance = new AssetsBalance();

    await assetBalance.setAssets(
      POLKADOT_ACCOUNT_MOCK,
      {
        provider: POLKADOT_PROVIDER_MOCK as unknown as ApiPromise,
        type: ChainType.WASM,
      },
      "astar"
    );

    assetBalance.reset();

    expect(
      assetBalance._assets[POLKADOT_ACCOUNT_MOCK.key]?.["astar"]
    ).toBeUndefined();
  });

  it("get local assets", async () => {
    const assetBalance = new AssetsBalance();

    await assetBalance.setAssets(
      POLKADOT_ACCOUNT_MOCK,
      {
        provider: POLKADOT_PROVIDER_MOCK as unknown as ApiPromise,
        type: ChainType.WASM,
      },
      "astar"
    );

    const assets = assetBalance.getLocalAssets();

    expect(assets[POLKADOT_ACCOUNT_MOCK.key]["astar"]).toBeDefined();
  });

  it("get network", async () => {
    const assetBalance = new AssetsBalance();

    await assetBalance.setAssets(
      POLKADOT_ACCOUNT_MOCK,
      {
        provider: POLKADOT_PROVIDER_MOCK as unknown as ApiPromise,
        type: ChainType.WASM,
      },
      "astar"
    );

    const networks = assetBalance.getNetwork();

    expect(networks).toEqual(["astar"]);
  });

  it("loadAssets", async () => {
    const assetBalance = new AssetsBalance();

    await assetBalance.loadAssets(
      POLKADOT_ACCOUNT_MOCK,
      {
        astar: {
          provider: POLKADOT_PROVIDER_MOCK as unknown as ApiPromise,
          type: ChainType.WASM,
        },
      },
      ["astar"]
    );

    const assets =
      assetBalance._assets[POLKADOT_ACCOUNT_MOCK.key]["astar"].assets;
    expect(assets[0]).toEqual({ ...NATIVE_WASM_ASSETS_MOCK[0], price: "0.1" });
    expect(assets[1]).toEqual(NON_NATIVE_WASM_ASSETS_MOCK[0]);
  });

  it("init", () => {
    const assetBalance = new AssetsBalance();

    assetBalance.init();

    expect(assetBalance._assets).toEqual({});
  });

  it("updateOneAsset", async () => {
    nativeAssetsHoisted.getNativeAssetBalance.mockReturnValue(
      NATIVE_WASM_ASSETS_MOCK[0]
    );
    const assetBalance = new AssetsBalance();
    await assetBalance.setAssets(
      POLKADOT_ACCOUNT_MOCK,
      {
        provider: POLKADOT_PROVIDER_MOCK as unknown as ApiPromise,
        type: ChainType.WASM,
      },
      "astar"
    );

    assetBalance["updateOneAsset"](
      POLKADOT_ACCOUNT_MOCK.key,
      {
        balance: "2000000000000000000",
      },
      "-1",
      "astar"
    );

    const assets =
      assetBalance._assets[POLKADOT_ACCOUNT_MOCK.key]["astar"].assets;

    expect(assets[0]).toMatchObject({
      balance: "2000000000000000000",
      transferable: "2000000000000000000",
    });
  });

  it("deleteAsset", async () => {
    nativeAssetsHoisted.getNativeAssetBalance.mockReturnValue(
      NATIVE_WASM_ASSETS_MOCK[0]
    );
    const assetBalance = new AssetsBalance();
    await assetBalance.setAssets(
      POLKADOT_ACCOUNT_MOCK,
      {
        provider: POLKADOT_PROVIDER_MOCK as unknown as ApiPromise,
        type: ChainType.WASM,
      },
      "astar"
    );

    assetBalance["deleteAsset"](
      POLKADOT_ACCOUNT_MOCK,
      {
        astar: {
          provider: POLKADOT_PROVIDER_MOCK as unknown as ApiPromise,
          type: ChainType.WASM,
        },
      },
      ["astar"]
    );

    const assets = assetBalance.getAssets().getValue();

    expect(Object.keys(assets).length).toEqual(0);
  });
});
