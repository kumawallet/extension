import { ASSETS_ICONS } from "./assets-icons";
import { ChainType } from "@src/types"
export const ASSETS_TRANSAK = [
    {
        "network-name": "Ethereum",
        network: "ethereum",
        logo: ASSETS_ICONS["ETH"],
        symbol: "ETH",
        type: ChainType.EVM,
        isSupportSell: true
    },
    {
        "network-name": "Ethereum",
        network: "ethereum",
        logo: ASSETS_ICONS["USDC"],
        symbol: "USDC",
        type: ChainType.EVM,
        isSupportSell: true
    },
    {
        "network-name": "Ethereum",
        network: "ethereum",
        logo: ASSETS_ICONS["USDT"],
        symbol: "USDT",
        type: ChainType.EVM,
        isSupportSell: true
    },
    {
        "network-name": "Polygon",
        network: "polygon",
        logo: ASSETS_ICONS["USDT"],
        symbol: "USDT",
        type: ChainType.EVM,
        isSupportSell: true
    },
    {
        "network-name": "Binance",
        network: "bsc",
        logo: ASSETS_ICONS["USDT"],
        symbol: "USDT",
        type: ChainType.EVM,
        isSupportSell: false
    },
    {
        "network-name": "Binance",
        network: "bsc",
        logo:  ASSETS_ICONS["BNB"],
        symbol: "BNB",
        type: ChainType.EVM,
        isSupportSell: true
    },
    {
        "network-name": "Binance",
        network: "bsc",
        logo: ASSETS_ICONS["USDC"],
        symbol: "USDC",
        type: ChainType.EVM,
        isSupportSell: true
    },
    {
        "network-name": "Polkadot",
        network: "mainnet",
        logo: ASSETS_ICONS["DOT"],
        symbol: "DOT",
        prefix: 0,
        type: ChainType.WASM,
        isSupportSell: true
    },
    {
        "network-name": "Ethereum",
        network: "ethereum",
        logo: ASSETS_ICONS["WBTC"],
        symbol: "WBTC",
        type: ChainType.EVM,
        isSupportSell: false
    },
    {
        "network-name": "Polygon",
        network: "polygon",
        logo: ASSETS_ICONS["WBTC"],
        symbol: "WBTC",
        type: ChainType.EVM,
        isSupportSell: false
    },
    {
        "network-name": "Polygon",
        network: "polygon",
        logo: ASSETS_ICONS["MATIC"],
        symbol: "MATIC",
        type: ChainType.EVM,
        isSupportSell: true
    },
    {
        "network-name": "Polygon",
        network: "polygon",
        logo: ASSETS_ICONS["DAI"],
        symbol: "DAI",
        type: ChainType.EVM,
        isSupportSell: false
    },
    {
        "network-name": "Kusama",
        network: "mainnet",
        logo: ASSETS_ICONS["KSM"],
        symbol: "KSM",
        prefix: 2,
        type: ChainType.WASM,
        isSupportSell: true
    },
    {   "network-name": "Astar",
        network: "astar",
        logo: ASSETS_ICONS["ASTR"],
        symbol: "ASTR",
        prefix: 5,
        type: ChainType.WASM,
        isSupportSell: false

    }
]