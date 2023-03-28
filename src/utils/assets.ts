import { ApiPromise } from "@polkadot/api";
import { BN } from "@polkadot/util";
import { BigNumberish, ethers } from "ethers";

export const getNatitveAssetBalance = async (
  api: ApiPromise | ethers.providers.JsonRpcProvider | null,
  accountAddress: string
): Promise<BN | BigNumberish> => {
  try {
    const _amount = new BN("0");

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
    console.error(error);
    return 0;
  }
};

export const getAssetUSDPrice = async (assetName: string) => {
  try {
    const data = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${assetName}&vs_currencies=usd`
    );

    const json = await data.json();

    return json?.[assetName]?.["usd"] || 0;
  } catch (error) {
    console.error(error);
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
