import { MUMBAI_TESTNET } from "@src/constants/chains";

export const EarningAssets = {
  [MUMBAI_TESTNET.name]: {
    assets: ["fDAIx", "fUSDCx"],
    assetPairs: {
      fDAIx: ["fUSDCx"],
      fUSDCx: ["fDAIx"],
    },
    contractAddress: "0x0794c89b0767d480965574Af38052aab32496E00",
    chainId: 80001,
  },
};
