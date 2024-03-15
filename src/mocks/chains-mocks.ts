import { OldChain } from "@src/types";

export const wasmOldChain: OldChain = {
  name: "Bifrost",
  supportedAccounts: ["WASM"],
  rpc: {
    wasm: "wss://bifrost-polkadot-rpc.dwellir.com",
  },
  addressPrefix: 6,
  nativeCurrency: {
    name: "BNC",
    symbol: "BNC",
    decimals: 12,
  },
  explorer: {
    wasm: {
      name: "",
      url: "https://wasmOldChain.com",
    },
  },
  logo: "",
};

export const evmOldChain: OldChain = {
  name: "Arbitrum",
  supportedAccounts: ["EVM"],
  rpc: {
    evm: "https://arb1.arbitrum.io/rpc",
  },
  addressPrefix: 0,
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  explorer: {
    evm: {
      name: "",
      url: "https://arbiscan.io",
    },
  },
  logo: "",
};

export const multiOldChain: OldChain = {
  name: "Astar-test",
  supportedAccounts: ["WASM", "EVM"],
  rpc: {
    wasm: "wss://astar-rpc.dwellir.com",
    evm: "https://evm.astar.network",
  },
  addressPrefix: 5,
  nativeCurrency: {
    name: "ASTR",
    symbol: "ASTR",
    decimals: 18,
  },
  explorer: {
    wasm: {
      name: "",
      url: "https://astar.subscan.io",
    },
    evm: {
      name: "",
      url: "https://blockscout.com/astar",
    },
  },
  logo: "",
  xcm: ["polkadot", "acala", "moonbeam"],
};
