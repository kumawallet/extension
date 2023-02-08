import { ApiPromise } from "@polkadot/api";
import { ethers } from "ethers";

export const getNatitveAssetBalance = async (
  api: ApiPromise | ethers.providers.JsonRpcProvider | null,
  accountAddress: string,
  decimals: number
) => {
  try {
    if (!api) return 0;

    if ("query" in api) {
      const { data }: any =
        (await api.query.system?.account(accountAddress)) || {};

      const amount = data?.free;
      const _decimals = 10 ** decimals;
      return amount ? Number(amount) / _decimals : 0;
    }

    if ("getBalance" in api) {
      const amount = ethers.utils.formatEther(
        await api.getBalance(accountAddress)
      );

      return amount;
    }

    return 0;
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
