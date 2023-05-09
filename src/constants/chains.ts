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
}

export const POLKADOT_PARACHAINS = {
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
  rpc: { wasm: "ws://127.0.0.1:9900" }, // change
  addressPrefix: 0,
  nativeCurrency: {
    name: "DOT",
    symbol: "DOT",
    decimals: 12, // change
  },
  logo: "polkadot",
  explorer: {
    wasm: {
      name: "subscan",
      url: "https://polkadot.subscan.io/",
    },
  },
  supportedAccounts: [WASM],
  xcm: [PARACHAINS.ASTAR, PARACHAINS.MOONBEAM],
};

export const ASTAR = {
  name: "Astar",
  rpc: {
    evm: "http://127.0.0.1:8920", // change
    wasm: "ws://127.0.0.1:9920", // change
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
  xcm: [RELAY_CHAINS.POLKADOT, PARACHAINS.MOONBEAM],
};

const MOONBEAM = {
  name: "Moonbeam",
  rpc: {
    evm: "http://localhost:8910", // change
    wasm: "ws://127.0.0.1:9920", // change
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
  xcm: [RELAY_CHAINS.POLKADOT, PARACHAINS.ASTAR],
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
      name: "subscanß",
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
  xcm: [RELAY_CHAINS.KUSAMA, PARACHAINS.ASTAR],
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
  xcm: [RELAY_CHAINS.KUSAMA, PARACHAINS.MOONBEAM],
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

export const MAINNETS: Chain[] = [
  POLKADOT,
  KUSAMA,
  ASTAR,
  MOONBEAM,
  MOONRIVER,
  SHIDEN,
  ETHEREUM,
];

export const TESTNETS: Chain[] = [MOONBASE_ALPHA, SHIBUYA, GOERLI];

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
