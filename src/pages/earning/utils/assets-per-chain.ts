import { MUMBAI_TESTNET } from "@src/constants/chains";

export const EarningAssets = {
  [MUMBAI_TESTNET.name]: {
    assets: ["DAIx", "USDCx"],
    assetPairs: {
      DAIx: ["USDCx"],
      USDCx: ["DAIx"],
    },
    contractAddress: "0x0794c89b0767d480965574Af38052aab32496E00",
    chainId: 80001,
  },
};
