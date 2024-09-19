import { BN } from "@polkadot/util";
import { EVM_CHAINS, SUBSTRATE_CHAINS } from "@src/constants/chainsData";
import {
  EVM_ACCOUNT_MOCK,
  POLKADOT_ACCOUNT_MOCK,
} from "@src/tests/mocks/account-mocks";
import { describe } from "vitest";
import { swapType, useSwap } from "./useSwap";
import { act, renderHook, waitFor } from "@testing-library/react";

const isLoadingMock = false;
const starLoadingMock = vi.fn();
const endLoadingMock = vi.fn();
const assetToBuyMock = vi.hoisted(() => ({
  value: vi.fn(),
}));
const showErrorToastMock = vi.fn();
const showSuccessToastMock = vi.fn();

const assetStealhex = [
  {
    id: "dot",
    symbol: "DOT",
    decimals: 10,
    balance: new BN("1"),
    network: "polkadot",
    address: "",
  },
  {
    id: "dot",
    symbol: "DOT",
    decimals: 10,
    balance: new BN("0"),
    network: "polkadot",
    address: "",
  },
  {
    id: "astr",
    symbol: "ASTR",
    decimals: 12,
    balance: new BN("0"),
    network: "astar",
    address: "",
  },
  {
    id: "aca",
    symbol: "ACA",
    decimals: 12,
    balance: new BN("0"),
    network: "acala",
    address: "",
  },
  {
    id: "kms",
    symbol: "KMS",
    decimals: 12,
    balance: new BN("0"),
    network: "kumasa",
    address: "",
  },
  {
    id: "shd",
    symbol: "SHD",
    decimals: 12,
    balance: new BN("0"),
    network: "shiden",
    address: "",
  },
];

const initStealhexMock = vi.fn().mockResolvedValue({
  nativeAssets: assetStealhex,
  pairs: assetStealhex,
  type: "stealhex",
  bridgeFee: "0.1%",
});

const accountMock = vi.hoisted(() => ({
  value: {
    key: "WASM-5GRjqTdQiyzoT7cmztRWPhLHdfdj1aLLM3bzqVQYL2EGXgNP",
    value: {
      address: "5GRjqTdQiyzoT7cmztRWPhLHdfdj1aLLM3bzqVQYL2EGXgNP",
      keyring: "wasm",
      name: "Polkadot Account",
      isDerivable: true,
    },
    type: "wasm",
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const updateTxMock = vi.hoisted(() => ({
  value: vi.fn(),
}));

vi.mock("@src/messageAPI/api", () => ({
  messageAPI: {
    getAssetsBuy: assetToBuyMock.value,
    getFee: vi.fn().mockResolvedValueOnce("12345"),
    networkSubscribe: vi.fn(),
    hydraSubscribeToSell: vi.fn(),
    hydraSubscribeToBuy: vi.fn(),
    initHydraDX: vi.fn(),
    setNetwork: vi.fn(),
    updateTx: updateTxMock.value,

    getFeeHydra: () => ({
      bridgeFee: "0.6%",
      destinationAddress: null,
      bridgeName: swapType.hydradx,
      gasFee: "8000000000",
      bridgeType: "protocol",
      swapInfo: {
        idAssetToSell: "0",
        idAsseToBuy: "5",
        amountSell: "10000000000000",
        amountBuy: "132173534",
        aliveUntil: 1725376554748,
        swaps: [
          {
            poolAddress: "7KsbYZTDHQ4AZp1PVAwxsu4cqBxyKceqqMMs2dQYCf9TkAxJ",
            pool: "Xyk",
            assetIn: "0",
            assetOut: "17",
            assetInDecimals: 12,
            assetOutDecimals: 10,
            amountIn: "10000000000000",
            calculatedOut: "48764248815",
            amountOut: "48617956071",
            spotPrice: "4889782639.258017",
            tradeFeePct: 0.3,
            priceImpactPct: -0.27,
            errors: [],
          },
          {
            poolAddress: "7L53bUTBbfuj14UpdCNPwmgzzHSsrsTWBHX5pys32mVWM3C1",
            pool: "Omnipool",
            assetIn: "17",
            assetOut: "5",
            assetInDecimals: 10,
            assetOutDecimals: 10,
            amountIn: "48617956071",
            calculatedOut: "132571081",
            amountOut: "132173534",
            spotPrice: "27267928",
            tradeFeePct: 0.3,
            tradeFeeRange: [0.3, 5.1],
            priceImpactPct: 0,
            errors: [],
          },
        ],
        slippage: 0.01,
        txHex:
          "0xf8044300000000000500000000a0724e180900000000000000000000d7a3cc0700000000000000000000000008000000000011000000031100000005000000",
        swapError: "",
      },
    }),
  },
}));

vi.mock("@src/hooks", () => ({
  useLoading: () => ({
    isLoading: isLoadingMock,
    starLoading: starLoadingMock,
    endLoading: endLoadingMock,
  }),
  useToast: () => ({
    showErrorToast: showErrorToastMock,
    showSuccessToast: showSuccessToastMock,
  }),
}));

const mockSwapper = {
  init: initStealhexMock,
  getEstimatedAmount: vi.fn().mockReturnValue({
    estimatedAmount: String(new BN(10)),
    minAmount: String(new BN(5)),
  }),
  showRecipentAddressFormat: () => true,
  createSwap: () => ({
    destination: "0x2fer32Fwn23",
    fee: "23014205",
    id: "8234bns34",
  }),
  mustConfirmTx: () => true,
};
vi.mock("../stealthEX", async () => {
  const actual = await vi.importActual("../stealthEX");
  return {
    ...actual,
    StealthEX: vi.fn(() => mockSwapper),
  };
});

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return actual;
});

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const useSwapRender = () => renderHook(() => useSwap());
describe("useSwap", () => {
  beforeAll(() => {
    vi.mock("@src/providers", async () => {
      const actual = await vi.importActual("@src/providers");
      return {
        ...actual,
        useAssetContext: () => ({
          state: {
            assets: {
              [POLKADOT_ACCOUNT_MOCK.key]: {
                polkadot: {
                  assets: [
                    {
                      id: "-1",
                      symbol: "DOT",
                      decimals: 10,
                      balance: new BN("1"),
                      address: "",
                    },
                  ],
                },
                hydradx: {
                  assets: [
                    {
                      id: "-1",
                      symbol: "HDX",
                      decimals: 18,
                      balance: new BN("10"),
                      address: "",
                    },
                  ],
                },
              },
              [EVM_ACCOUNT_MOCK.key]: {
                ethereum: {
                  assets: [
                    {
                      id: "-1",
                      symbol: "ETH",
                      decimals: 12,
                      balance: new BN("2"),
                      address: "",
                    },
                  ],
                },
              },
            },
          },
        }),
        useAccountContext: vi.fn().mockReturnValue({
          state: {
            selectedAccount: accountMock.value,
            accounts: [POLKADOT_ACCOUNT_MOCK, EVM_ACCOUNT_MOCK],
          },
        }),
        useNetworkContext: () => ({
          state: {
            selectedChain: {
              hydradx: {
                isTestnet: false,
                type: "wasm",
              },
              polkadot: {
                isTestnet: false,
                type: "wasm",
              },
              ethereum: {
                isTestnet: false,
                type: "evm",
              },
            },
            chains: [
              {
                title: "wasm_based",
                chains: SUBSTRATE_CHAINS.filter((chain) => !chain.isTestnet),
              },
              {
                title: "evm_based",
                chains: EVM_CHAINS.filter((chain) => !chain.isTestnet),
              },
            ],
          },
        }),
      };
    });
  });
  it("init WASM", async () => {
    const { result } = useSwapRender();
    await act(async () => {});

    expect(starLoadingMock).toHaveBeenCalled();
    expect(initStealhexMock).toHaveBeenCalledWith({
      chainIds: ["polkadot", "acala", "astar", "kusama", "shiden", "hydradx"],
    });
    expect(result.current.assetsToSell).toEqual(assetStealhex);
    expect(result.current.assetsToBuy).toEqual(assetStealhex);
  });

  it("should correctly", async () => {
    const { result } = useSwapRender();
    await act(async () => {});
    const { handleRecipientChange } = result.current;
    act(() => {
      handleRecipientChange("address", "new-address-value");
    });

    await waitFor(() => {
      expect(result.current.recipient.address).toEqual("new-address-value");
    });
  });
  it("init EVM", async () => {
    const { result } = useSwapRender();
    result.current.setSenderAddress(EVM_ACCOUNT_MOCK.value?.address as string);
    await act(async () => {
      await delay(10);
    });

    expect(starLoadingMock).toHaveBeenCalled();
    expect(initStealhexMock).toHaveBeenCalledWith({
      chainIds: ["polkadot", "acala", "astar", "kusama", "shiden", "hydradx"],
    });
    expect(result.current.assetsToSell).toEqual(assetStealhex);
    expect(result.current.assetsToBuy).toEqual(assetStealhex);
    expect(endLoadingMock).toHaveBeenCalled();
  });

  it("should correctly", async () => {
    const { result } = useSwapRender();
    await act(async () => {});
    const { handleRecipientChange } = result.current;
    act(() => {
      handleRecipientChange("address", "new-address-value");
    });

    await waitFor(() => {
      expect(result.current.recipient.address).toEqual("new-address-value");
    });
  });

  it("handleAmounts WASM", async () => {
    const { result } = renderHook(() => useSwap());

    result.current.setAssetToBuy({
      id: "5",
      symbol: "DOT",
      label: "DOT",
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png",
      balance: "0",
      decimals: 10,
      network: "hydradx",
      name: "Polkadot",
      chainId: "5",
      type: swapType.hydradx,
    });
    result.current.setAssetToSell({
      id: "0",
      symbol: "HDX",
      label: "HDX",
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/6753.png",
      balance: "301554350420982",
      decimals: 12,
      network: "hydradx",
      name: "Hydration",
      chainId: "0",
      type: swapType.hydradx,
    });
    await delay(10);
    await act(async () => {
      await result.current.handleAmounts("sell", "5");
    });
    await delay(10);
    expect(result.current.amounts.buy).toEqual("0.0132173534");
  });
  it("handleAmounts EVM", async () => {
    const { result } = renderHook(() => useSwap());
    result.current.setSenderAddress(EVM_ACCOUNT_MOCK.value?.address as string);
    await delay(20);
    result.current.setAssetToBuy({
      id: "5",
      symbol: "DOT",
      label: "DOT",
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png",
      balance: "0",
      decimals: 10,
      network: "polkadot",
      name: "Polkadot",
      chainId: "5",
      type: swapType.stealhex,
    });
    result.current.setAssetToSell({
      id: "0",
      symbol: "ASTR",
      label: "ASTR",
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/6753.png",
      balance: "301554350420982",
      decimals: 12,
      network: "astar",
      name: "Astar",
      chainId: "0",
      type: swapType.stealhex,
    });
    await delay(10);
    await act(async () => {
      await result.current.handleAmounts("sell", "5");
    });
    await delay(10);
    expect(result.current.amounts.buy).toEqual(String(new BN(10)));
    expect(starLoadingMock).toHaveBeenCalled();
    expect(result.current.minSellAmount).toEqual(String(new BN(5)));
  });
  it("handleAssetChange Sell", async () => {
    const { result } = renderHook(() => useSwap());
    result.current.setAssetToBuy({
      id: "5",
      symbol: "DOT",
      label: "DOT",
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png",
      balance: "0",
      decimals: 10,
      network: "hydradx",
      name: "Polkadot",
      chainId: "5",
      type: swapType.hydradx,
    });
    await delay(10);
    await act(async () => {
      await result.current.handleAssetChange("sell", {
        id: "0",
        symbol: "HDX",
        label: "HDX",
        image: "https://s2.coinmarketcap.com/static/img/coins/64x64/6753.png",
        balance: "301554350420982",
        decimals: 12,
        network: "hydradx",
        name: "Hydration",
        chainId: "0",
        type: swapType.hydradx,
      });
    });
    expect(assetToBuyMock.value).toHaveBeenCalled();
    expect(endLoadingMock).toHaveBeenCalled();
  });
  it("handleAssetChange Buy", async () => {
    const { result } = renderHook(() => useSwap());
    result.current.setAssetToBuy({
      id: "5",
      symbol: "DOT",
      label: "DOT",
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png",
      balance: "0",
      decimals: 10,
      network: "hydradx",
      name: "Polkadot",
      chainId: "5",
      type: swapType.hydradx,
    });
    await delay(10);
    await act(async () => {
      await result.current.handleAssetChange("buy", {
        id: "0",
        symbol: "HDX",
        label: "HDX",
        image: "https://s2.coinmarketcap.com/static/img/coins/64x64/6753.png",
        balance: "301554350420982",
        decimals: 12,
        network: "hydradx",
        name: "Hydration",
        chainId: "0",
        type: swapType.hydradx,
      });
    });

    await delay(10);
    expect(starLoadingMock).toHaveBeenCalled();
    expect(result.current.assetToBuy).toEqual({
      id: "0",
      symbol: "HDX",
      label: "HDX",
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/6753.png",
      balance: "301554350420982",
      decimals: 12,
      network: "hydradx",
      name: "Hydration",
      chainId: "0",
      type: swapType.hydradx,
    });
    expect(endLoadingMock).toHaveBeenCalled();
  });
  it("setMaxAmout", async () => {
    const { result } = renderHook(() => useSwap());
    result.current.setAssetToSell({
      id: "5",
      symbol: "DOT",
      label: "DOT",
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png",
      balance: "1000000000",
      decimals: 10,
      network: "hydradx",
      name: "Polkadot",
      chainId: "5",
      type: swapType.hydradx,
    });
    await delay(10);
    result.current.setMaxAmout();
    await delay(10);

    expect(result.current.amounts.sell).toEqual("0.1");
  });
  it("setSenderAddress", async () => {
    const { result } = renderHook(() => useSwap());
    result.current.setSenderAddress(EVM_ACCOUNT_MOCK.value?.address as string);
    await delay(10);
    expect(result.current.tx.addressFrom).toEqual(
      EVM_ACCOUNT_MOCK.value?.address as string
    );
  });
  it("swap WASM", async () => {
    const { result } = renderHook(() => useSwap());
    result.current.setAssetToBuy({
      id: "5",
      symbol: "DOT",
      label: "DOT",
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png",
      balance: "0",
      decimals: 10,
      network: "hydradx",
      name: "Polkadot",
      chainId: "5",
      type: swapType.hydradx,
    });
    result.current.setAssetToSell({
      id: "0",
      symbol: "ASTR",
      label: "ASTR",
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/6753.png",
      balance: "301554350420982",
      decimals: 12,
      network: "hydradx",
      name: "Astar",
      chainId: "0",
      type: swapType.hydradx,
    });
    await delay(10);
    result.current.handleAmounts("sell", "5");
    await delay(10);

    await act(async () => {
      await result.current.swap();
    });
    expect(starLoadingMock).toHaveBeenCalled();
    expect(updateTxMock.value).toHaveBeenCalledWith({
      tx: {
        amount: "5",
        senderAddress: "5GRjqTdQiyzoT7cmztRWPhLHdfdj1aLLM3bzqVQYL2EGXgNP",
        destinationAddress: "5GRjqTdQiyzoT7cmztRWPhLHdfdj1aLLM3bzqVQYL2EGXgNP",
        swapInfo: {
          txHex:
            "0xf8044300000000000500000000a0724e180900000000000000000000d7a3cc0700000000000000000000000008000000000011000000031100000005000000",
        },
        originNetwork: {
          id: "hydradx",
          name: "HydraDX",
          rpcs: ["wss://rpc.hydradx.cloud"],
          prefix: 63,
          symbol: "HDX",
          decimals: 12,
          explorer: "https://hydration.subscan.io/",
          logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/6753.png",
          isTestnet: false,
          isCustom: false,
          type: "wasm",
        },
        targetNetwork: {
          id: "hydradx",
          name: "HydraDX",
          rpcs: ["wss://rpc.hydradx.cloud"],
          prefix: 63,
          symbol: "HDX",
          decimals: 12,
          explorer: "https://hydration.subscan.io/",
          logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/6753.png",
          isTestnet: false,
          isCustom: false,
          type: "wasm",
        },
        asset: {
          id: "0",
          symbol: "ASTR",
          balance: "301554350420982",
          decimals: 12,
          address: "",
        },
      },
    });
  });

  it("swap EVM", async () => {
    const { result } = renderHook(() => useSwap());
    result.current.setSenderAddress(EVM_ACCOUNT_MOCK.value?.address as string);
    await delay(20);
    result.current.setAssetToSell({
      id: "ethereum",
      symbol: "ETH",
      label: "ETH",
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/6753.png",
      balance: "301554350420982",
      decimals: 12,
      network: "ethereum",
      name: "Ethereum",
      chainId: "ethereum",
      type: swapType.stealhex,
    });

    await delay(10);
    result.current.handleAmounts("sell", "5");
    await delay(10);

    await act(async () => {
      await result.current.swap();
    });
    expect(starLoadingMock).toHaveBeenCalled();
    expect(updateTxMock.value).toBeCalledWith({
      tx: {
        amount: "5",
        senderAddress: "0xa6C654b833829659A8D978C4380C351d7E005904",
        destinationAddress: "0x2fer32Fwn23",
        originNetwork: {
          id: "ethereum",
          name: "Ethereum",
          rpcs: [
            "https://rpc.ankr.com/eth",
            "https://eth.api.onfinality.io/public",
            "https://eth.llamarpc.com",
          ],
          symbol: "ETH",
          decimals: 18,
          explorer: "https://etherscan.io",
          logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
          isTestnet: false,
          isCustom: false,
          type: "evm",
        },
        targetNetwork: {
          id: "ethereum",
          name: "Ethereum",
          rpcs: [
            "https://rpc.ankr.com/eth",
            "https://eth.api.onfinality.io/public",
            "https://eth.llamarpc.com",
          ],
          symbol: "ETH",
          decimals: 18,
          explorer: "https://etherscan.io",
          logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
          isTestnet: false,
          isCustom: false,
          type: "evm",
        },
        asset: {
          id: "ethereum",
          symbol: "ETH",
          balance: new BN(2),
          decimals: 12,
          address: "",
        },
      },
    });
  });
});
