import { utils } from "ethers";

export const getHash = (hash: string) => {
  return hash.slice(0, 12) + "..." + hash.slice(-12);
};

export const getValue = (data: {
  value: string;
  symbol: string;
  tip?: string;
}) => {
  if (!data || !data.value) return "$0.0";
  return data.symbol ? `${data.value} ${data.symbol}` : `$${data.value}`;
};

export const getTip = (
  data: {
    tip: string;
    symbol: string;
  },
  tip?: string
) => {
  if (!tip || !!data.tip) return `0.0 ${data.symbol}`;
  return `${tip || data.tip} ${data.symbol}`;
};

export const estimatedFee = (
  data: {
    fee: string;
    symbol: string;
  },
  chainDecimals: number
) => {
  if (data.fee) {
    const fee = utils.formatUnits(data.fee, chainDecimals);
    return `${Number(fee)} ${data.symbol}`;
  }
  return "";
};
