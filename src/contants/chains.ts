type suppotedAccountType = "wasm" | "evm";
export interface Chain {
  name: string;
  chain?: string;
  rpc: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  explorers: {
    name: string;
    url: string;
  }[];
  supportedAccounts?: suppotedAccountType[];
}

export const RELAYCHAINS: Chain[] = [
  {
    name: "Polkadot",
    chain: "substrate",
    rpc: ["wss://rpc.polkadot.io"],
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
    supportedAccounts: ["wasm"],
  },
  {
    name: "Kusama",
    chain: "substrate",
    rpc: ["wss://kusama-rpc.polkadot.io"],
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
    supportedAccounts: ["wasm"],
  },
];

export const PARACHAINS = [
  {
    name: "Astar",
    chain: "ASTR",
    rpc: ["https://rpc.astar.network:8545"],
    faucets: [],
    nativeCurrency: {
      name: "Astar",
      symbol: "ASTR",
      decimals: 18,
    },
    infoURL: "https://astar.network/",
    shortName: "astr",
    chainId: 592,
    networkId: 592,
    icon: "astar",
    explorers: [
      {
        name: "subscan",
        url: "https://astar.subscan.io",
        standard: "none",
        icon: "subscan",
      },
    ],
  },
  {
    name: "Moonbeam",
    chain: "MOON",
    rpc: ["https://rpc.api.moonbeam.network", "wss://wss.api.moonbeam.network"],
    faucets: [],
    nativeCurrency: {
      name: "Glimmer",
      symbol: "GLMR",
      decimals: 18,
    },
    infoURL: "https://moonbeam.network/networks/moonbeam/",
    shortName: "mbeam",
    chainId: 1284,
    networkId: 1284,
    explorers: [
      {
        name: "moonscan",
        url: "https://moonbeam.moonscan.io",
        standard: "none",
      },
    ],
  },

  {
    name: "Moonriver",
    chain: "MOON",
    rpc: [
      "https://rpc.api.moonriver.moonbeam.network",
      "wss://wss.api.moonriver.moonbeam.network",
    ],
    faucets: [],
    nativeCurrency: {
      name: "Moonriver",
      symbol: "MOVR",
      decimals: 18,
    },
    infoURL: "https://moonbeam.network/networks/moonriver/",
    shortName: "mriver",
    chainId: 1285,
    networkId: 1285,
    explorers: [
      {
        name: "moonscan",
        url: "https://moonriver.moonscan.io",
        standard: "none",
      },
    ],
  },
  {
    name: "Shiden",
    chain: "SDN",
    rpc: [
      "https://shiden.api.onfinality.io/public",
      "https://shiden-rpc.dwellir.com",
      "https://shiden.public.blastapi.io",
      "wss://shiden.api.onfinality.io/public-ws",
      "wss://shiden.public.blastapi.io",
      "wss://shiden-rpc.dwellir.com",
    ],
    faucets: [],
    nativeCurrency: {
      name: "Shiden",
      symbol: "SDN",
      decimals: 18,
    },
    infoURL: "https://shiden.astar.network/",
    shortName: "sdn",
    chainId: 336,
    networkId: 336,
    icon: "shiden",
    explorers: [
      {
        name: "subscan",
        url: "https://shiden.subscan.io",
        standard: "none",
        icon: "subscan",
      },
    ],
  },
];

export const TESTNETS = [
  {
    name: "Moonbase Alpha",
    chain: "MOON",
    rpc: [
      "https://rpc.api.moonbase.moonbeam.network",
      "wss://wss.api.moonbase.moonbeam.network",
    ],
    faucets: [],
    nativeCurrency: {
      name: "Dev",
      symbol: "DEV",
      decimals: 18,
    },
    infoURL: "https://docs.moonbeam.network/networks/testnet/",
    shortName: "mbase",
    chainId: 1287,
    networkId: 1287,
    explorers: [
      {
        name: "moonscan",
        url: "https://moonbase.moonscan.io",
        standard: "none",
      },
    ],
  },
  {
    name: "Shibuya",
    chain: "substrate",
    rpc: [],
    faucets: [],
    nativeCurrency: {
      name: "shibuya",
      symbol: "SBY",
      decimals: 18,
    },
    // infoURL: "https://shiden.astar.network/",
    // shortName: "sdn",
    // chainId: 336,
    // networkId: 336,
    // icon: "shiden",
    explorers: [
      {
        name: "subscan",
        url: "https://shibuya.subscan.io/",
        standard: "none",
        icon: "subscan",
      },
    ],
  },
];

export const CHAINS = [
  {
    name: "Relay chains",
    chains: RELAYCHAINS,
  },
  {
    name: "Parachains",
    chains: PARACHAINS,
  },
  {
    name: "Testnets",
    chains: TESTNETS,
  },
];
