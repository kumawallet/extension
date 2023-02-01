import { ApiPromise } from "@polkadot/api";

export const getNatitveAssetBalance = async (
  api: ApiPromise,
  accountAddress: string,
  decimals: number
) => {
  console.log(api.query.system);

  const data = await api.query.system?.account(accountAddress);

  const amount = data?.data?.free;

  console.log(amount);

  const _decimals = 10 ** decimals;

  return amount ? Number(amount) / _decimals : 0;
};
