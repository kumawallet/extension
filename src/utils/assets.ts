import { ApiPromise } from "@polkadot/api";

export const getNatitveAssetBalance = async (
  api: ApiPromise,
  accountAddress: string,
  decimals: number
) => {
  try {
    const { data }: any =
      (await api.query.system?.account(accountAddress)) || {};

    const amount = data?.free;
    const _decimals = 10 ** decimals;
    return amount ? Number(amount) / _decimals : 0;
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
