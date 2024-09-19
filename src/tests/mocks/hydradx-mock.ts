import { ASSETS_ICONS } from "@src/constants/assets-icons";
import { swapType } from "@src/pages";
import { ChainType } from "@src/types";
import BigNumber from "bignumber.js";


export const assetToSell = {
    id: "5",
    symbol: "DOT",
    label: "DOT",
    image: ASSETS_ICONS["DOT"],
    balance : "0",
    decimals: 18,
    network: "hydradx" as string,
    name: "Polkadot" as string,
    chainId: "5",
    type: swapType.hydradx
  
}

export const assetToBuy = {
    id: "9",
    symbol: "ASTR",
    label: "ASTR",
    image: ASSETS_ICONS["ASTR"],
    balance : "0",
    decimals: 18,
    network: "hydradx" as string,
    name: "Astar" as string,
    chainId: "9",
    type: swapType.hydradx
  
}

export const swapMock = [
  {
    poolAddress: '7L53bUTBbfuj14UpdCNPwmgzzHSsrsTWBHX5pys32mVWM3C1',
    pool: 'Omnipool',
    assetIn: '5',
    assetOut: '9',
    assetInDecimals: 10,
    assetOutDecimals: 18,
    amountIn: '500000000000',
    calculatedOut: '3255498570963322337271',
    amountOut: '3245238520245030700720',
    spotPrice: '65120277207769065131',
    tradeFeePct: 0.32,
    tradeFeeRange: [0.3, 5.1],
    priceImpactPct: -0.02,
    errors: [] 
  }
]

export const mockAssets = [
    { id: "5", symbol: "DOT", decimals: 18, name: "Polkadot" },
    { id: "9", symbol: "ASTR", decimals: 18, name: "Astar" },
  ];

export const mockProvider = { 
    type: ChainType.WASM,
    provider: { isReady: Promise.resolve() }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any

export const mockAssetsInit = [
    {
        id: "5",
        symbol: "DOT",
        label: "DOT",
        image: ASSETS_ICONS["DOT"],
        balance : "0",
        decimals: 18,
        network: "hydradx" as string,
        name: "Polkadot" as string,
        chainId: "5",
        type: swapType.hydradx
      
    },
    {
        id: "9",
        symbol: "ASTR",
        label: "ASTR",
        image: ASSETS_ICONS["ASTR"],
        balance : "0",
        decimals: 18,
        network: "hydradx" as string,
        name: "Astar" as string,
        chainId: "9",
        type: swapType.hydradx
      
    },

]

 export const mockSwapResult = {
    type: 'Sell',
    amountIn: '500000000000',
    amountOut: new BigNumber('3245238520245030700720'),
    spotPrice: '65120277207769065131',
    tradeFee: '10260050718291636551',
    tradeFeePct: 0.32,
    tradeFeeRange: [0.3, 5.1],
    priceImpactPct: -0.02,
    toTx: vi.fn().mockReturnValue({ hex: '0x123' }),
    swaps: swapMock
  };

