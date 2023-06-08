import { AccountType } from "@src/accounts/types";
import { Chain } from "@src/storage/entities/Chains";

const WASM = "WASM" as AccountType.WASM;
const EVM = "EVM" as AccountType.EVM;

export const enum RELAY_CHAINS {
  POLKADOT = "Polkadot",
  KUSAMA = "Kusama",
}

export const enum PARACHAINS {
  ASTAR = "Astar",
  MOONBEAM = "Moonbeam",
  SHIDEN = "Shiden",
  MOONRIVER = "Moonriver",
  ACALA = "Acala",
}

export const POLKADOT_PARACHAINS = {
  ACALA: {
    name: PARACHAINS.ACALA,
    id: 2000,
  },
  ASTAR: {
    name: PARACHAINS.ASTAR,
    id: 2006,
  },
  MOONBEAM: {
    name: PARACHAINS.MOONBEAM,
    id: 2004,
  },
};

export const KUSAMA_PARACHAINS = {
  SHIDEN: {
    name: PARACHAINS.SHIDEN,
    id: 2007,
  },
  MOONRIVER: {
    name: PARACHAINS.MOONRIVER,
    id: 2023,
  },
};

// MAINNETS
export const POLKADOT = {
  name: "Polkadot",
  rpc: { wasm: "wss://rpc.polkadot.io" },
  addressPrefix: 0,
  nativeCurrency: {
    name: "DOT",
    symbol: "DOT",
    decimals: 10,
  },
  logo: "polkadot",
  explorer: {
    wasm: {
      name: "subscan",
      url: "https://polkadot.subscan.io/",
    },
  },
  supportedAccounts: [WASM],
  xcm: [PARACHAINS.ASTAR, PARACHAINS.MOONBEAM, PARACHAINS.ACALA],
};

export const ASTAR = {
  name: "Astar",
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
  explorer: {
    evm: {
      name: "subscan",
      url: "https://astar.subscan.io/",
    },
    wasm: {
      name: "subscan",
      url: "https://astar.subscan.io/",
    },
  },
  logo: "astar",
  supportedAccounts: [WASM, EVM],
  xcm: [RELAY_CHAINS.POLKADOT, PARACHAINS.MOONBEAM, PARACHAINS.ACALA],
};

const MOONBEAM = {
  name: "Moonbeam",
  rpc: {
    evm: "https://rpc.api.moonbeam.network",
  },
  addressPrefix: 1284,
  nativeCurrency: {
    name: "Glimmer",
    symbol: "GLMR",
    decimals: 18,
  },
  explorer: {
    evm: {
      name: "moonscan",
      url: "https://moonbeam.moonscan.io/",
    },
  },
  logo: "moonbeam",
  supportedAccounts: [EVM],
  xcm: [RELAY_CHAINS.POLKADOT, PARACHAINS.ASTAR, PARACHAINS.ACALA],
};

const ACALA = {
  name: "Acala",
  rpc: {
    wasm: "wss://acala-rpc-0.aca-api.network",
  },
  addressPrefix: 10,
  nativeCurrency: {
    name: "ACA",
    symbol: "ACA",
    decimals: 12,
  },
  logo: "acala",
  explorer: {
    wasm: {
      name: "subscan",
      url: "https://acala.subscan.io/",
    },
  },
  supportedAccounts: [WASM],
  xcm: [RELAY_CHAINS.POLKADOT, PARACHAINS.MOONBEAM, PARACHAINS.ASTAR],
};

const KUSAMA = {
  name: "Kusama",
  rpc: { wasm: "wss://kusama-rpc.polkadot.io" },
  addressPrefix: 2,
  nativeCurrency: {
    name: "KSM",
    symbol: "KSM",
    decimals: 12,
  },
  logo: "kusama",
  explorer: {
    wasm: {
      name: "subscan",
      url: "https://kusama.subscan.io/",
    },
  },
  supportedAccounts: [WASM],
  xcm: [PARACHAINS.SHIDEN, PARACHAINS.MOONRIVER],
};

const ETHEREUM = {
  name: "Ethereum",
  rpc: { evm: "https://eth.llamarpc.com" },
  addressPrefix: 1,
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  explorer: {
    evm: {
      name: "etherscan",
      url: "https://etherscan.io/",
    },
  },
  logo: "ethereum",
  supportedAccounts: [EVM],
};

const POLYGON = {
  name: "Polygon Mainnet",
  chain: "Polygon",
  icon: "polygon",
  rpc: {
    evm: "https://polygon-rpc.com/",
  },
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
  explorer: {
    evm: {
      name: "polygonscan",
      url: "https://polygonscan.com",
    },
  },
  logo: "polygon",
  supportedAccounts: [EVM],
};

const BINANCE = {
  name: "Binance Smart Chain Mainnet",
  chain: "BSC",
  rpc: {
    evm: "https://bsc-dataseed1.binance.org",
  },
  nativeCurrency: {
    name: "Binance Chain Native Token",
    symbol: "BNB",
    decimals: 18,
  },
  logo: "binance",
  explorer: {
    evm: {
      name: "bscscan",
      url: "https://bscscan.com",
    },
  },
  supportedAccounts: [EVM],
};

const MOONRIVER = {
  name: "Moonriver",
  rpc: {
    evm: "https://rpc.api.moonriver.moonbeam.network",
    wasm: "wss://wss.api.moonriver.moonbeam.network",
  },
  addressPrefix: 1284,
  nativeCurrency: {
    name: "Moonriver",
    symbol: "MOVR",
    decimals: 18,
    rpc: {
      evm: "https://rpc.api.moonriver.moonbeam.network",
    },
    addressPrefix: 1284,
    nativeCurrency: {
      name: "Moonriver",
      symbol: "MOVR",
      decimals: 18,
    },

    explorer: {
      evm: {
        name: "moonscan",
        url: "https://moonriver.moonscan.io/",
      },
    },
    logo: "moonriver",
    supportedAccounts: [EVM],
  },

  explorer: {
    evm: {
      name: "moonscan",
      url: "https://moonriver.moonscan.io/",
    },
  },
  logo: "moonriver",
  supportedAccounts: [EVM],
  xcm: [RELAY_CHAINS.KUSAMA, PARACHAINS.SHIDEN],
};

const SHIDEN = {
  name: "Shiden",
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
  explorer: {
    evm: {
      name: "subscan",
      url: "https://shiden.subscan.io/",
    },
    wasm: {
      name: "subscan",
      url: "https://shiden.subscan.io/",
    },
  },
  logo: "shiden",
  supportedAccounts: [EVM, WASM],
  xcm: [RELAY_CHAINS.KUSAMA, PARACHAINS.MOONRIVER],
};

// TESTNETS
const MOONBASE_ALPHA = {
  name: "Moonbase Alpha",
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
  explorer: {
    evm: {
      name: "moonscan",
      url: "https://moonbase.moonscan.io/",
    },
    wasm: {
      name: "moonscan",
      url: "https://moonbase.moonscan.io/",
    },
  },
  logo: "moonbeam",
  supportedAccounts: [EVM],
};

export const SHIBUYA = {
  name: "Shibuya",
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

  explorer: {
    evm: {
      name: "subscan",
      url: "https://shibuya.subscan.io/",
    },
    wasm: {
      name: "subscan",
      url: "https://shibuya.subscan.io/",
    },
  },
  logo: "astar",
  supportedAccounts: [EVM, WASM],
};

export const GOERLI = {
  name: "Goerli",
  rpc: { evm: "https://goerli.infura.io/v3/" },
  addressPrefix: 5,
  nativeCurrency: {
    name: "GoerliETH",
    symbol: "GoerliETH",
    decimals: 18,
  },
  explorer: {
    evm: {
      name: "etherscan",
      url: "https://goerli.etherscan.io/",
    },
  },
  logo: "ethereum",
  supportedAccounts: [EVM],
};

export const BNB_TESTNET = {
  name: "Binance Smart Chain Testnet",
  rpc: {
    evm: "https://data-seed-prebsc-1-s1.binance.org:8545",
  },
  addressPrefix: 5,
  nativeCurrency: {
    name: "Binance Chain Native Token",
    symbol: "tBNB",
    decimals: 18,
  },
  explorer: {
    evm: {
      name: "bscscan",
      url: "https://testnet.bscscan.com/",
    },
  },
  logo: "binance",
  supportedAccounts: [EVM],
};

export const MUMBAI_TESTNET = {
  name: "Polygon Testnet Mumbai",
  rpc: {
    evm: "https://rpc-mumbai.maticvigil.com/",
  },
  addressPrefix: 5,
  nativeCurrency: {
    name: "Matic",
    symbol: "MATIC",
    decimals: 18,
  },
  explorer: {
    evm: {
      name: "polygonscan",
      url: "https://mumbai.polygonscan.com/",
    },
  },
  logo: "polygon",
  supportedAccounts: [EVM],
};

export const SEPOLIA = {
  name: "Sepolia",
  rpc: {
    evm: "https://rpc.sepolia.org",
  },
  addressPrefix: 5,
  nativeCurrency: {
    name: "Sepolia Ether",
    symbol: "ETH",
    decimals: 18,
  },
  explorer: {
    evm: {
      name: "subscan",
      url: "https://sepolia.subscan.io/",
    },
  },
  logo: "ethereum",
  supportedAccounts: [EVM],
};

export const MANDALA = {
  name: "Mandala",
  rpc: {
    wasm: "wss://mandala-rpc.aca-staging.network/ws",
  },
  addressPrefix: 42,
  nativeCurrency: {
    name: "Acala Token",
    symbol: "mACA",
    decimals: 12,
  },
  explorer: {
    wasm: {
      name: "subscan",
      url: "https://acala-testnet.subscan.io/",
    },
  },
  logo: "acala",
  supportedAccounts: [WASM],
};

export const ROCOCO = {
  name: "Rococo",
  rpc: {
    wasm: "wss://rococo-rpc.polkadot.io",
  },
  addressPrefix: 42,
  nativeCurrency: {
    name: "Rococo",
    symbol: "ROC",
    decimals: 12,
  },
  explorer: {
    wasm: {
      name: "subscan",
      url: "https://rococo.subscan.io/",
    },
  },
  logo: "rococo",
  supportedAccounts: [WASM],
};

export const WESTEND = {
  name: "Westend",
  rpc: {
    wasm: "wss://westend-rpc.polkadot.io",
  },
  addressPrefix: 42,
  nativeCurrency: {
    name: "WND",
    symbol: "WND",
    decimals: 12,
  },
  explorer: {
    wasm: {
      name: "polkascan",
      url: "https://westend.subscan.io/",
    },
  },
  logo: "kusama",
  supportedAccounts: [WASM],
};

export const MAINNETS: Chain[] = [
  POLKADOT,
  KUSAMA,
  ASTAR,
  ACALA,
  MOONBEAM,
  MOONRIVER,
  SHIDEN,
  ETHEREUM,
  POLYGON,
  BINANCE,
];

export const TESTNETS: Chain[] = [
  MOONBASE_ALPHA,
  SHIBUYA,
  GOERLI,
  BNB_TESTNET,
  MUMBAI_TESTNET,
  SEPOLIA,
  MANDALA,
  ROCOCO,
  WESTEND,
];

export const CHAINS = [
  {
    name: "mainnets",
    chains: MAINNETS,
  },
  {
    name: "testnets",
    chains: TESTNETS,
  },
];

export const DEFAULT_WASM_CHAIN = CHAINS[0].chains[0];
export const DEFAULT_EVM_CHAIN = CHAINS[0].chains[2];
