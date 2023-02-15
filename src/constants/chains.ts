import { AccountType } from "@src/accounts/types";

const WASM = "WASM" as AccountType.WASM;
const EVM = "EVM" as AccountType.EVM;
type supportedAccountType = AccountType;
export interface Chain {
  name: string;
  chain?: string;
  addressPrefix?: number;
  rpc: {
    wasm?: string;
    evm?: string;
  };
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  explorers: {
    name: string;
    url: string;
  }[];
  supportedAccounts: supportedAccountType[];
}

export const MAINNETS: Chain[] = [
  {
    name: "Polkadot",
    chain: "substrate",
    rpc: { wasm: "wss://rpc.polkadot.io" },
    addressPrefix: 0,
    nativeCurrency: {
      name: "DOT",
      symbol: "DOT",
      decimals: 10,
    },
    explorers: [
      {
        name: "subscan",
        url: "https://polkadot.subscan.io/",
      },
    ],
    supportedAccounts: [WASM],
  },
  {
    name: "Kusama",
    chain: "substrate",
    rpc: { wasm: "wss://kusama-rpc.polkadot.io" },
    addressPrefix: 2,
    nativeCurrency: {
      name: "KSM",
      symbol: "KSM",
      decimals: 12,
    },
    explorers: [
      {
        name: "subscanß",
        url: "https://kusama.subscan.io/",
      },
    ],
    supportedAccounts: [WASM],
  },
  {
    name: "Ethereum",
    chain: "ethereum",
    rpc: { evm: "https://eth.llamarpc.com" },
    addressPrefix: 1,
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    explorers: [
      {
        name: "etherscan",
        url: "https://etherscan.io/",
      },
    ],
    supportedAccounts: [EVM],
  },
];

export const PARACHAINS: Chain[] = [
  {
    name: "Astar",
    chain: "ASTR",
    rpc: {
      evm: "https://evm.astar.network",
      wasm: "wss://rpc.astar.network",
    },
    addressPrefix: 5,
    nativeCurrency: {
      name: "Astar",
      symbol: "ASTR",
      decimals: 18,
    },
    explorers: [
      {
        name: "subscan",
        url: "https://astar.subscan.io",
      },
    ],
    supportedAccounts: [WASM, EVM],
  },
  {
    name: "Moonbeam",
    chain: "MOON",
    rpc: {
      evm: "https://rpc.api.moonbeam.network",
      wasm: "wss://wss.api.moonbeam.network",
    },
    addressPrefix: 1284,
    nativeCurrency: {
      name: "Glimmer",
      symbol: "GLMR",
      decimals: 18,
    },
    explorers: [
      {
        name: "moonscan",
        url: "https://moonbeam.moonscan.io",
      },
    ],
    supportedAccounts: [EVM, WASM],
  },

  {
    name: "Moonriver",
    chain: "MOON",
    rpc: {
      evm: "https://rpc.api.moonriver.moonbeam.network",
      wasm: "wss://wss.api.moonriver.moonbeam.network",
    },
    addressPrefix: 1284,
    nativeCurrency: {
      name: "Moonriver",
      symbol: "MOVR",
      decimals: 18,
    },

    explorers: [
      {
        name: "moonscan",
        url: "https://moonriver.moonscan.io",
      },
    ],
    supportedAccounts: [EVM],
  },
  {
    name: "Shiden",
    chain: "SDN",
    rpc: {
      evm: "https://evm.shiden.astar.network",
      wasm: "wss://shiden.api.onfinality.io/public-ws",
    },
    addressPrefix: 5,
    nativeCurrency: {
      name: "Shiden",
      symbol: "SDN",
      decimals: 18,
    },
    explorers: [
      {
        name: "subscan",
        url: "https://shiden.subscan.io",
      },
    ],
    supportedAccounts: [EVM, WASM],
  },
];

export const TESTNETS: Chain[] = [
  {
    name: "Moonbase Alpha",
    chain: "MOON",
    rpc: {
      evm: "https://rpc.api.moonbase.moonbeam.network",
      wasm: "wss://wss.api.moonbase.moonbeam.network",
    },
    addressPrefix: 1287,
    nativeCurrency: {
      name: "Dev",
      symbol: "DEV",
      decimals: 18,
    },
    explorers: [
      {
        name: "moonscan",
        url: "https://moonbase.moonscan.io",
      },
    ],
    supportedAccounts: [EVM, WASM],
  },
  {
    name: "Shibuya",
    chain: "substrate",
    rpc: {
      evm: "https://evm.shibuya.astar.network",
      wasm: "wss://shibuya-rpc.dwellir.com",
    },
    nativeCurrency: {
      name: "shibuya",
      symbol: "SBY",
      decimals: 18,
    },
    addressPrefix: 5,

    explorers: [
      {
        name: "subscan",
        url: "https://shibuya.subscan.io/",
      },
    ],
    supportedAccounts: [EVM, WASM],
  },
  {
    name: "Contracts Testnet",
    chain: "Rococo",
    rpc: {
      wasm: "wss://rococo-contracts-rpc.polkadot.io",
    },
    nativeCurrency: {
      name: "roc",
      symbol: "ROC",
      decimals: 12,
    },
    explorers: [
      {
        name: "",
        url: "",
      },
    ],
    supportedAccounts: [WASM],
  },
  {
    name: "Goerli",
    chain: "goerli",
    rpc: { evm: "https://goerli.infura.io/v3/" },
    addressPrefix: 5,
    nativeCurrency: {
      name: "GoerliETH",
      symbol: "GoerliETH",
      decimals: 18,
    },
    explorers: [
      {
        name: "etherscan",
        url: "https://goerli.etherscan.io",
      },
    ],
    supportedAccounts: [EVM],
  },
];

export const CHAINS = [
  {
    name: "mainnets",
    chains: MAINNETS,
  },
  {
    name: "parachains",
    chains: PARACHAINS,
  },
  {
    name: "testnets",
    chains: TESTNETS,
  },
];

export const DEFAULT_WASM_CHAIN = CHAINS[0].chains[0];
export const DEFAULT_EVM_CHAIN = CHAINS[0].chains[2];
