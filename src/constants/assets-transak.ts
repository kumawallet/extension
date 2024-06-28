import { ASSETS_ICONS } from "./assets-icons";
import { ChainType } from "@src/types"
export const ASSETS_TRANSAK = [
    {
        name: "Ethereum",
        id: "ethereum",
        logo: ASSETS_ICONS["ETH"],
        symbol: "ETH",
        type: ChainType.EVM,
        isSupportSell: true
    },
    {
        name: "Ethereum",
        id: "ethereum",
        logo: ASSETS_ICONS["USDC"],
        symbol: "USDC",
        type: ChainType.EVM,
        isSupportSell: true
    },
    {
        name: "Ethereum",
        id: "ethereum",
        logo: ASSETS_ICONS["USDT"],
        symbol: "USDT",
        type: ChainType.EVM,
        isSupportSell: true
    },
    {
        name: "Polygon",
        id: "polygon",
        logo: ASSETS_ICONS["USDT"],
        symbol: "USDT",
        type: ChainType.EVM,
        isSupportSell: true
    },
    {
        name: "Binance",
        network: "bsc",
        logo: ASSETS_ICONS["USDT"],
        symbol: "USDT",
        type: ChainType.EVM,
        isSupportSell: false
    },
    {
        name: "Binance",
        network: "bsc",
        logo:  ASSETS_ICONS["BNB"],
        symbol: "BNB",
        type: ChainType.EVM,
        isSupportSell: true
    },
    {
        name: "Binance",
        network: "bsc",
        logo: ASSETS_ICONS["USDC"],
        symbol: "USDC",
        type: ChainType.EVM,
        isSupportSell: false
    },
    {
        name: "Polkadot",
        network: "mainnet",
        logo: ASSETS_ICONS["DOT"],
        symbol: "DOT",
        prefix: 0,
        type: ChainType.WASM,
        isSupportSell: false
    },
    {
        name: "Ethereum",
        network: "ethereum",
        logo: ASSETS_ICONS["WBTC"],
        symbol: "WBTC",
        type: ChainType.EVM,
        isSupportSell: false
    },
    {
        name: "Polygon",
        network: "polygon",
        logo: ASSETS_ICONS["WBTC"],
        symbol: "WBTC",
        type: ChainType.EVM,
        isSupportSell: false
    },
    {
        name: "Polygon",
        network: "polygon",
        logo: ASSETS_ICONS["MATIC"],
        symbol: "MATIC",
        type: ChainType.EVM,
        isSupportSell: true
    },
    {
        name: "Polygon",
        network: "polygon",
        logo: ASSETS_ICONS["DAI"],
        symbol: "DAI",
        type: ChainType.EVM,
        isSupportSell: false
    },
    {
        name: "Kusama",
        network: "mainnet",
        logo: ASSETS_ICONS["KSM"],
        symbol: "KSM",
        prefix: 2,
        type: ChainType.WASM,
        isSupportSell: false
    },
    {   name: "Astar",
        network: "astar",
        logo: ASSETS_ICONS["ASTR"],
        symbol: "ASTR",
        prefix: 5,
        type: ChainType.WASM,
        isSupportSell: false

    }
]