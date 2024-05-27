import { BN } from "bn.js";
import { BigNumber } from "ethers";

export const REF_TIME = new BN("1000000000000");
export const PROOF_SIZE = new BN("1000000000000");

export const BigNumber0 = BigNumber.from(0);
export const BN0 = new BN("0");

export const defaultAssetConfig = {
  "moonbeam-evm": [
    {
      address: "0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080",
      symbol: "DOT",
      decimals: 10,
    },
    {
      address: "0xFfFFFfffA893AD19e540E172C10d78D4d479B5Cf",
      symbol: "ASTR",
      decimals: 18,
    },
  ],

  sepolia: [
    {
      address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
      symbol: "WETH",
      decimals: 18,
    },
  ],

  "moonriver-evm": [
    {
      address: "0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080",
      symbol: "KSM",
      decimals: 12,
    },
    {
      address: "0xFFFfffFF0Ca324C842330521525E7De111F38972",
      symbol: "SDN",
      decimals: 18,
    },
  ],

  "zeta-chain": [
    {
      address: "0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891",
      symbol: "tBNB",
      decimals: 18,
    },
    {
      address: "0x13A0c5930C028511Dc02665E7285134B6d11A5f4",
      symbol: "gETH",
      decimals: 18,
    },
    {
      address: "0x48f80608B672DC30DC7e3dbBd0343c5F02C738Eb",
      symbol: "tMATIC",
      decimals: 18,
    },
    {
      address: "0x65a45c57636f9BcCeD4fe193A602008578BcA90b",
      symbol: "tBTC",
      decimals: 18,
    },
  ],

  binance: [
    {
      address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      symbol: "BUSD",
      decimals: 18,
    },
    {
      address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
      symbol: "DAI",
      decimals: 18,
    },
    {
      address: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
      symbol: "DOT",
      decimals: 18,
    },
    {
      address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      symbol: "ETH",
      decimals: 18,
    },
    {
      address: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
      symbol: "MATIC",
      decimals: 18,
    },
    {
      address: "0xe35c6ceb0643f75909dfF6acC5B7FaFfBDd52412",
      symbol: "USDT",
      decimals: 18,
    },
    {
      address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      symbol: "USDC",
      decimals: 18,
    },
  ],

  polygon: [
    {
      address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      symbol: "DAI",
      decimals: 18,
    },
    {
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      symbol: "USDT",
      decimals: 6,
    },
    {
      address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
      symbol: "WBTC",
      decimals: 8,
    },
  ],

  ethereum: [
    {
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      symbol: "DAI",
      decimals: 18,
    },
    {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      symbol: "USDC",
      decimals: 6,
    },
    {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      symbol: "USDT",
      decimals: 6,
    },
    {
      address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      symbol: "WBTC",
      decimals: 8,
    },
    // {
    //   address: "0xa6FB1DF483b24EEAB569e19447E0e107003B9E15",
    //   symbol: "ENB",
    //   decimals: 18,
    // },
  ],
};

export const COINGECKO_ASSET_MAP: { [key: string]: string } = {
  xcatom: "cosmos",
  bnc: "bifrost-native-coin",
  glmr: "moonbeam",
  dot: "polkadot",
  aca: "acala",
  ldot: "liquid-staking-dot",
  hdx: "hydradx",
  ausd: "acala-dollar",
  matic: "matic-network",
  eth: "ethereum",
  usdt: "tether",
  ibtc: "interbtc",
  intr: "Interlay",
  pha: "pha",
  unq: "unq",
  vdot: "voucher-dot",
  astr: "astar",
  xcdot: "polkadot",
  xchdx: "hydradx",
  xcausd: "acala-dollar",
  xcibtc: "interbtc",
  xcusdt: "tether",
  xcpha: "pha",
  xcbnc: "bifrost-native-coin",
  xcastr: "astar",
  xcaca: "acala",
};
