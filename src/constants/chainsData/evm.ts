import { Chain } from "@src/types";
import { ASSETS_ICONS } from "../assets-icons";
import ZETA_LOGO from "/images/zeta.png";

export const EVM_CHAINS: Chain[] = [
  {
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
    logo: ASSETS_ICONS["ETH"],
    isTestnet: false,
    isCustom: false,
    type: "evm",
  },
  {
    id: "acala-evm",
    name: "Acala EVM",
    rpcs: [
      "https://eth-rpc-acala.aca-api.network",
      "https://rpc.evm.acala.network",
    ],
    symbol: "ACA",
    decimals: 18,
    explorer: "https://blockscout.acala.network",
    logo: ASSETS_ICONS["ACA"],
    isTestnet: false,
    isCustom: false,
    type: "evm",
  },
  {
    id: "astar-evm",
    name: "Astar EVM",
    rpcs: [
      "https://evm.astar.network",
      "https://astar-rpc.dwellir.com",
      "https://astar.api.onfinality.io/public",
    ],
    symbol: "ASTR",
    decimals: 18,
    explorer: "https://blockscout.com/astar",
    logo: ASSETS_ICONS["ASTR"],
    isTestnet: false,
    isCustom: false,
    type: "evm",
  },
  {
    id: "moonbeam-evm",
    name: "Moonbeam",
    rpcs: [
      "https://rpc.api.moonbeam.network",
      "https://moonbeam-rpc.dwellir.com",
      "https://moonbeam.api.onfinality.io/public",
    ],
    symbol: "GLMR",
    decimals: 18,
    explorer: "https://moonbeam.moonscan.io/",
    logo: ASSETS_ICONS["GLMR"],
    isTestnet: false,
    isCustom: false,
    type: "evm",
  },
  {
    id: "polygon",
    name: "Polygon Mainnet",
    rpcs: [
      "https://polygon-rpc.com/",
      "https://rpc.ankr.com/polygon",
      "https://polygon-mainnet.public.blastapi.io",
    ],
    symbol: "MATIC",
    decimals: 18,
    explorer: "https://polygonscan.com/",
    logo: ASSETS_ICONS["MATIC"],
    isTestnet: false,
    isCustom: false,
    type: "evm",
  },
  {
    id: "binance",
    name: "BNB Chain",
    rpcs: [
      "https://rpc.ankr.com/bsc",
      "https://bsc-dataseed2.binance.org",
      "https://bsc-dataseed3.binance.org",
      "https://bsc-dataseed4.binance.org",
    ],
    symbol: "BNB",
    decimals: 18,
    explorer: "https://bscscan.com/",
    logo: ASSETS_ICONS["BNB"],
    isTestnet: false,
    isCustom: false,
    type: "evm",
  },
  {
    id: "moonriver-evm",
    name: "Moonriver",
    rpcs: [
      "https://rpc.moonriver.moonbeam.network",
      "https://moonriver-rpc.dwellir.com",
      "https://moonriver.api.onfinality.io/public",
    ],
    symbol: "MOVR",
    decimals: 18,
    explorer: "https://moonriver.moonscan.io/",
    logo: ASSETS_ICONS["MOVR"],
    isTestnet: false,
    isCustom: false,
    type: "evm",
  },

  // TESTNETS ========================================

  {
    id: "goerli",
    name: "Goerli",
    rpcs: ["https://rpc.ankr.com/eth_goerli", "https://goerli.infura.io/v3/"],
    symbol: "ETH",
    decimals: 18,
    explorer: "https://goerli.etherscan.io",
    logo: ASSETS_ICONS["ETH"],
    isTestnet: true,
    isCustom: false,
    type: "evm",
  },
  {
    id: "sepolia",
    name: "Sepolia",
    rpcs: ["https://rpc.sepolia.org"],
    symbol: "ETH",
    decimals: 18,
    explorer: "https://sepolia.etherscan.io",
    logo: ASSETS_ICONS["ETH"],
    isTestnet: true,
    isCustom: false,
    type: "evm",
  },
  {
    id: "moonbase-alpha",
    name: "Moonbase Alpha",
    rpcs: [
      "https://rpc.api.moonbase.moonbeam.network",
      "https://moonbeam-alpha.api.onfinality.io/public",
    ],
    symbol: "DEV",
    decimals: 18,
    explorer: "https://moonbase.moonscan.io/",
    logo: ASSETS_ICONS["GLMR"],
    isTestnet: true,
    isCustom: false,
    type: "evm",
  },
  {
    id: "mumbai",
    name: "Polygon Testnet Mumbai",
    rpcs: [
      "https://rpc-mumbai.maticvigil.com",
      "https://polygon-mumbai-bor.publicnode.com",
      "https://polygon-mumbai.gateway.tenderly.co",
    ],
    symbol: "MATIC",
    decimals: 18,
    explorer: "https://mumbai.polygonscan.com",
    logo: ASSETS_ICONS["MATIC"],
    isTestnet: true,
    isCustom: false,
    type: "evm",
  },
  {
    id: "bnb-testnet",
    name: "BNB Chain Testnet",
    rpcs: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
    symbol: "BNB",
    decimals: 18,
    explorer: "https://testnet.bscscan.com/",
    logo: ASSETS_ICONS["BNB"],
    isTestnet: true,
    isCustom: false,
    type: "evm",
  },
  {
    id: "shibuya-evm",
    name: "Shibuya EVM",
    rpcs: ["https://evm.shibuya.astar.network"],
    symbol: "SBY",
    decimals: 18,
    explorer: "https://shibuya.subscan.io",
    logo: ASSETS_ICONS["ASTR"],
    isTestnet: true,
    isCustom: false,
    type: "evm",
  },
  {
    id: "zeta-chain",
    name: "Zeta Chain",
    rpcs: ["https://zetachain-athens-evm.blockpi.network/v1/rpc/public"],
    symbol: "aZETA",
    decimals: 18,
    explorer: "https://zetachain-athens-3.blockscout.com/",
    logo: ZETA_LOGO,
    isTestnet: true,
    isCustom: false,
    type: "evm",
  },
];
