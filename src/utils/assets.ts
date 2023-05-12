import { ApiPromise } from "@polkadot/api";
import { BN } from "@polkadot/util";
import { BN0 } from "@src/constants/assets";
import { BigNumberish, ethers } from "ethers";

export const getNatitveAssetBalance = async (
  api: ApiPromise | ethers.providers.JsonRpcProvider | null,
  accountAddress: string
): Promise<BN | BigNumberish> => {
  try {
    const _amount = BN0;

    if (!api) return _amount;

    if ("query" in api) {
      const { data }: any =
        (await api.query.system?.account(accountAddress)) || {};

      return data.free as BN;
    }

    if ("getBalance" in api) {
      const amount = await api.getBalance(accountAddress);
      return amount;
    }

    return _amount;
  } catch (error) {
    return BN0;
  }
};

export const getAssetUSDPrice = async (assetName: string) => {
  const _assetName = assetName.toLowerCase();
  try {
    const data = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${_assetName}&vs_currencies=usd`
    );

    const json = await data.json();

    return json?.[_assetName]?.["usd"] || 0;
  } catch (error) {
    return 0;
  }
};

export const formatAmountWithDecimals = (
  amount: number,
  decimals = 0,
  assetDecimals = 0
) => {
  return Number((amount / 10 ** assetDecimals || 0).toFixed(decimals));
};

export const formatBN = (bn: string, decimals: number) => {
  let _number = bn;

  if (_number.length < decimals) {
    const dif = decimals - _number.length;
    for (let index = 0; index < dif + 1; index++) {
      _number = `0${_number}`;
    }
  }
  _number = _number.slice(0, -decimals) + "." + _number.slice(-decimals);

  while (_number.endsWith("0")) {
    _number = _number.slice(0, _number.length - 1);
  }

  if (_number.endsWith(".")) {
    _number = "0";
  }

  return _number;
};

export const formatUSDAmount = (amount: number) => {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 6,
  });
};
