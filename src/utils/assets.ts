import { ApiPromise } from "@polkadot/api";
import { ethers } from "ethers";

export const getNatitveAssetBalance = async (
  api: ApiPromise | ethers.providers.JsonRpcProvider | null,
  accountAddress: string,
  decimals: number
): Promise<number> => {
  try {
    let _amount = 0;

    if (!api) return _amount;

    if ("query" in api) {
      const { data }: any =
        (await api.query.system?.account(accountAddress)) || {};

      _amount = data?.free;
      const _decimals = 10 ** decimals;
      _amount = _amount ? Number(_amount) / _decimals : 0;
    }

    if ("getBalance" in api) {
      const etherAmount = ethers.utils.formatEther(
        await api.getBalance(accountAddress)
      );
      _amount = Number(etherAmount);
    }

    return Number(_amount);
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

export const formatAmountWithDecimals = (amount: number, decimals = 0) => {
  return Number((amount || 0).toFixed(decimals));
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
