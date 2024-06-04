import { ApiPromise } from "@polkadot/api";
import { Asset, ChainType, SubstrateBalance } from "@src/types";
import AssetsBalance from "./AssetBalance";
import Account from "./Account";
import { AccountType } from "@src/accounts/types";
import { providers } from "ethers";
import { OlProvider } from "@src/services/ol/OlProvider";
import { BN0 } from "@src/constants/assets";

const BALANCE_MOCK = "1000000000000000000";

const POLKADOT_ACCOUNT_MOCK: Account = {
  key: "WASM-5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F",
  type: AccountType.WASM,
  value: {
    address: "5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F",
    keyring: AccountType.WASM,
    name: "Wasm Account",
  },
};

const EVM_ACCOUNT_MOCK: Account = {
  key: "EVM-0x0",
  type: AccountType.EVM,
  value: {
    address: "0x0",
    keyring: AccountType.EVM,
    name: "EVM Account",
  },
};

const OL_ACCOUNT_MOCK: Account = {
  key: "OL-0x0",
  type: AccountType.OL,
  value: {
    address: "0x0",
    keyring: AccountType.OL,
    name: "OL Account",
  },
};

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

const NATIVE_WASM_ASSETS_MOCK: Asset[] = [
  {
    id: "-1",
    symbol: "ASTR",
    amount: "0",
    balance: BALANCE_MOCK,
    decimals: 18,
    transferable: "0",
    price: "0",
  },
];

const NON_NATIVE_WASM_ASSETS_MOCK: Asset[] = [
  {
    id: "-1",
    symbol: "USDT",
    amount: "0",
    balance: BALANCE_MOCK,
    decimals: 6,
    transferable: "0",
    price: "0",
  },
];

const NATIVE_EVM_ASSETS_MOCK: Asset[] = [
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

const NON_NATIVE_EVM_ASSETS_MOCK: Asset[] = [
  {
    id: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    symbol: "USDT",
    amount: "0",
    balance: BALANCE_MOCK,
    decimals: 6,
    price: "0",
  },
];

const NATIVE_OL_ASSETS_MOCK: Asset[] = [
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
  getNatitveAssetBalance: vi.fn(),
}));

describe("AssetsBalance", () => {
  beforeAll(() => {
    vi.mock("@src/utils/assets", async () => {
      const actual = await import("@src/utils/assets");
      return {
        ...actual,
        getNatitveAssetBalance: nativeAssetsHoisted.getNatitveAssetBalance,
        getAssetUSDPrice: () => ({}),
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
      nativeAssetsHoisted.getNatitveAssetBalance.mockReturnValue(
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
      expect(assets[0]).toEqual(NATIVE_WASM_ASSETS_MOCK[0]);
      expect(assets[1]).toEqual(NON_NATIVE_WASM_ASSETS_MOCK[0]);
    });

    it("should load evm assets", async () => {
      nativeAssetsHoisted.getNatitveAssetBalance.mockReturnValue(
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

      expect(assets[0]).toEqual(NATIVE_EVM_ASSETS_MOCK[0]);
      expect(assets[1]).toMatchObject({
        ...NON_NATIVE_EVM_ASSETS_MOCK[0],
      });
    });

    it("should load ol assets", async () => {
      nativeAssetsHoisted.getNatitveAssetBalance.mockReturnValue(
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
    expect(assets[0]).toEqual(NATIVE_WASM_ASSETS_MOCK[0]);
    expect(assets[1]).toEqual(NON_NATIVE_WASM_ASSETS_MOCK[0]);
  });

  it("init", () => {
    const assetBalance = new AssetsBalance();

    assetBalance.init();

    expect(assetBalance._assets).toEqual({});
  });

  it("updateOneAsset", async () => {
    nativeAssetsHoisted.getNatitveAssetBalance.mockReturnValue(
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
});
