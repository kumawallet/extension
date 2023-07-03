import { ApiPromise } from "@polkadot/api";
import { BN, hexToBn, hexToString } from "@polkadot/util";
import { BN0 } from "@src/constants/assets";
import { BigNumberish, ethers } from "ethers";
import { captureError } from "./error-handling";
import { Asset } from "@src/providers/assetProvider/types";
import {
  GenericStorageEntryFunction,
  PromiseResult,
  StorageEntryBase,
  StorageEntryPromiseOverloads,
} from "@polkadot/api/types";
import { AnyTuple } from "@polkadot/types-codec/types";

export const getNatitveAssetBalance = async (
  api: ApiPromise | ethers.providers.JsonRpcProvider | null,
  accountAddress: string
) => {
  const _amounts = {
    balance: BN0,
  };
  try {
    if (!api) return _amounts;

    if ("query" in api) {
      const { data } = (await api.query.system?.account(
        accountAddress
      )) as unknown as {
        data: {
          free: string;
          reserved: string;
          miscFrozen?: string;
          frozen?: string;
          feeFrozen?: string;
        };
      };

      return getSubtrateNativeBalance(data);
    }

    if ("getBalance" in api) {
      const amount = await api.getBalance(accountAddress);
      return {
        balance: amount,
      };
    }

    return _amounts;
  } catch (error) {
    captureError(error);
    return _amounts;
  }
};

export const getAssetUSDPrice = async (query: string) => {
  const _query = query.toLowerCase();
  try {
    const data = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${_query}&vs_currencies=usd`
    );

    const json = await data.json();

    return json?.[_query]?.["usd"] || 0;
  } catch (error) {
    captureError(error);
    return 0;
  }
};

export const formatAmountWithDecimals = (
  amount = 0,
  decimals = 0,
  assetDecimals = 0
) => {
  return Number((amount / 10 ** assetDecimals).toFixed(decimals));
};

export const formatBN = (bn: string, decimals: number) => {
  let _number = bn;

  if (!decimals) return "0";

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

  if (_number.startsWith(".")) {
    _number = `0${_number}`;
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

export const getWasmAssets = async (
  api: ApiPromise,
  chainName: string,
  address: string,
  dispatch: (
    assetId: string,
    amounts: {
      balance: BN;
      frozen: BN;
      reserved: BN;
      transferable: BN;
    }
  ) => void
) => {
  let assets: Asset[] = [];
  const unsubs: unknown[] = [];
  try {
    let assetPallet = null;
    let balanceMethod:
      | (PromiseResult<GenericStorageEntryFunction> &
          StorageEntryBase<"promise", GenericStorageEntryFunction, AnyTuple> &
          StorageEntryPromiseOverloads)
      | null = null;

    switch (chainName) {
      case "Acala":
      case "Mandala":
        assetPallet = api.query.assetRegistry.assetMetadatas;
        balanceMethod = api.query.tokens.accounts;
        break;
      default:
        assetPallet = api.query.assets?.metadata;
        balanceMethod = api.query.assets?.account;
        break;
    }

    if (!assetPallet || !balanceMethod)
      return {
        assets,
        unsubs,
      };

    const entries = await assetPallet?.entries();

    for (const [, [metadata, asset]] of entries.entries()) {
      const jsonAsset = asset.toJSON() as {
        name: string;
        symbol: string;
        decimals: number;
      };

      const id = (metadata.args[0] as unknown as { id: number })?.id
        ? String((metadata.args[0] as unknown as { id: number })?.id)
        : metadata.args[0].toString();
      const name = hexToString(jsonAsset?.name || "");
      const symbol = hexToString(jsonAsset?.symbol || "");
      const balance = BN0;
      const decimals = Number(jsonAsset?.decimals || 0);

      let aditionalData: Asset["aditionalData"] = null;
      if (["acala", "mandala"].includes(chainName.toLowerCase())) {
        const token = metadata.args[0].toJSON() as {
          nativeAssetId?: { token: string };
          foreignAssetId?: string;
          stableAssetId?: string;
        };

        if (token?.nativeAssetId) {
          aditionalData = {
            tokenId: {
              Token: token?.nativeAssetId?.token,
            },
          };
        }
        if (token?.foreignAssetId) {
          aditionalData = {
            tokenId: {
              ForeignAsset: token.foreignAssetId,
            },
          };
        }
        if (token?.stableAssetId) {
          aditionalData = {
            tokenId: {
              StableAssetPoolToken: token.stableAssetId,
            },
          };
        }

        aditionalData &&
          assets.push({
            id,
            name,
            symbol,
            balance,
            frozen: BN0,
            reserved: BN0,
            transferable: balance,
            decimals,
            aditionalData,
          });
      } else {
        assets.push({
          id,
          name,
          symbol,
          balance,
          frozen: BN0,
          reserved: BN0,
          transferable: balance,
          decimals,
          aditionalData,
        });
      }
    }

    assets = await Promise.all(
      assets.map(async (asset) => {
        const params = [];
        if (["acala", "mandala"].includes(chainName.toLowerCase())) {
          params.push(address, asset.aditionalData?.tokenId);
        } else {
          params.push(asset.id, address);
        }

        const data = (await balanceMethod?.(...params)) as unknown as {
          toJSON: () => {
            balance: number | string;
            free: number;
            isFrozen?: boolean;
            reserved?: number;
            frozen?: number;
          };
        };

        const _data = getSubtrateNonNativeBalance(data);

        return { ...asset, ..._data };
      })
    );

    await Promise.all(
      assets.map(async (asset) => {
        const params = [];
        if (["acala", "mandala"].includes(chainName.toLowerCase())) {
          params.push(address, asset.aditionalData?.tokenId);
        } else {
          params.push(asset.id, address);
        }

        const unsub = await balanceMethod?.(
          ...params,
          (data: {
            toJSON: () => {
              balance: number | string;
              free: number;
              isFrozen?: boolean;
              reserved?: number;
              frozen?: number;
            };
          }) => {
            const _data = getSubtrateNonNativeBalance(data);
            dispatch(asset.id, _data);
          }
        );

        unsubs.push(unsub);
      })
    );
    return {
      assets,
      unsubs,
    };
  } catch (error) {
    captureError(error);
    return {
      assets,
      unsubs,
    };
  }
};

export const getSubtrateNativeBalance = (
  data:
    | {
        free: string;
        reserved: string;
        miscFrozen?: string;
        frozen?: string;
        feeFrozen?: string;
      }
    | undefined
) => {
  if (!data) {
    return {
      balance: BN0,
      frozen: BN0,
      reserved: BN0,
      transferable: BN0,
    };
  }

  const free = new BN(String(data?.free || 0));
  const reserved = new BN(String(data?.reserved || 0));
  const miscFrozen = new BN(String(data?.miscFrozen || data?.frozen || 0));
  const feeFrozen = new BN(String(data?.feeFrozen || 0));

  const frozen = miscFrozen.add(feeFrozen);

  const transferable = free.sub(frozen).sub(reserved);

  return {
    balance: free,
    transferable,
    reserved,
    frozen,
  };
};

export const getSubtrateNonNativeBalance = (
  data:
    | {
        toJSON: () => {
          balance: number | string;
          free: number;
          isFrozen?: boolean;
          reserved?: number;
          frozen?: number;
        };
      }
    | undefined
) => {
  if (!data) {
    return {
      balance: BN0,
      frozen: BN0,
      reserved: BN0,
      transferable: BN0,
    };
  }

  const result = data.toJSON();
  let balance = BN0;
  let frozen = BN0;
  let reserved = BN0;

  if (result?.balance && !result.isFrozen) {
    if (typeof result?.balance === "number") {
      balance = new BN(String(result?.balance));
    }

    if (
      typeof result.balance === "string" &&
      (result.balance as string).startsWith("0x")
    ) {
      balance = hexToBn(result.balance);
    }
  }

  if (result?.balance && result.isFrozen) {
    if (typeof result?.balance === "number") {
      frozen = new BN(String(result?.balance));
    }

    if (
      typeof result.balance === "string" &&
      (result.balance as string).startsWith("0x")
    ) {
      frozen = hexToBn(result.balance);
    }
  }

  if (result?.free) {
    if (
      typeof result?.free === "string" &&
      String(result.free)?.startsWith("0x")
    ) {
      balance = hexToBn(result.free);
    } else {
      balance = new BN(String(result?.free));
    }
  }

  if (result?.reserved) {
    if (
      typeof result?.reserved === "string" &&
      String(result.reserved)?.startsWith("0x")
    ) {
      reserved = hexToBn(result.reserved);
    } else {
      reserved = new BN(String(result?.reserved));
    }
  }

  if (result?.frozen) {
    if (
      typeof result?.frozen === "string" &&
      String(result.frozen)?.startsWith("0x")
    ) {
      frozen = hexToBn(result.frozen);
    } else {
      frozen = new BN(String(result?.frozen));
    }
  }

  return {
    balance,
    frozen,
    reserved,
    transferable: balance.sub(frozen).sub(reserved),
  };
};
