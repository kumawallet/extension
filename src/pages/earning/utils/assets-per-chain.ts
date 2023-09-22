import { MUMBAI_TESTNET } from "@src/constants/chains";

enum ASSETS {
  fDAIx = "fDAIx",
  fUSDCx = "fUSDCx",
}

export const ASSETS_INFO = {
  [ASSETS.fDAIx]: {
    label: "DAI",
    image:
      "https://assets.coingecko.com/coins/images/9956/small/dai-multi-collateral-mcd.png?1574218774",
  },
  [ASSETS.fUSDCx]: {
    label: "USDC",
    image:
      "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389",
  },
};

export const EarningAssets = {
  [MUMBAI_TESTNET.name]: {
    assets: [ASSETS.fDAIx, ASSETS.fUSDCx],
    assetPairs: {
      fDAIx: [ASSETS.fUSDCx],
      fUSDCx: [ASSETS.fDAIx],
    },
    contractAddress: "0x0794c89b0767d480965574Af38052aab32496E00",
    chainId: 80001,
  },
};
