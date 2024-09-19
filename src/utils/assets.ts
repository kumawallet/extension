import { ApiPromise } from "@polkadot/api";
import { BN, hexToBn } from "@polkadot/util";
import { BN0 } from "@src/constants/assets";
import { JsonRpcProvider } from "ethers";
import { captureError } from "./error-handling";
import {
  GenericStorageEntryFunction,
  PromiseResult,
  StorageEntryBase,
  StorageEntryPromiseOverloads,
} from "@polkadot/api/types";
import { AnyTuple } from "@polkadot/types-codec/types";
import { CURRENCIES } from "@utils/constants";
import { SUBSTRATE_ASSETS_MAP } from "@src/constants/assets-map";
import AccountEntity from "@src/storage/entities/Account";
import { OlProvider } from "@src/services/ol/OlProvider";
import {
  Asset,
  AssetBalance,
  ChainType,
  Provider,
  SubstrateBalance,
} from "@src/types";

export const getType = (type: string) => {
  if (type.includes("imported")) {
    return type.split("_")[1];
  }

  return type;
};

export const getNativeAssetBalance = async (
  api: {
    provider: Provider;
    type: ChainType;
  } | null,
  accountAddress: string,
  account: AccountEntity
): Promise<AssetBalance> => {
  const defaultAmount = {
    balance: BN0.toString(),
    transferable: BN0.toString(),
  };

  try {
    if (!api) return defaultAmount;

    const apiType = api.type;
    const chainType = getType(account.type.toLowerCase());

    if (apiType !== chainType) return defaultAmount;

    switch (apiType) {
      case ChainType.WASM: {
        const { data } = (await (
          api.provider as ApiPromise
        ).query.system.account(accountAddress)) as unknown as SubstrateBalance;

        return getSubtrateNativeBalance(data);
      }

      case ChainType.EVM: {
        const amount = await (api.provider as JsonRpcProvider).getBalance(
          accountAddress
        );
        return {
          balance: amount.toString(),
          transferable: amount.toString(),
        };
      }

      case ChainType.OL: {
        const balance = await (api.provider as OlProvider).getBalance(
          accountAddress
        );
        return {
          balance: balance.toString(),
          transferable: balance.toString(),
        };
      }
    }
  } catch (error) {
    captureError(error);
    return defaultAmount;
  }
};

export const getAssetUSDPrice = async (query: string[]) => {
  const _query = JSON.stringify(query.map((symbol) => symbol));
  const gqlQuery = `
  query {
    getTokenPrice(tokens: ${_query}) {
      tokens {
        usd,
        symbol
      }
    }
  }
`;
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/graphql`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: gqlQuery }),
      }
    );
    const obj: {
      [key: string]: number;
    } = {};
    const data = await response.json();
    const objPrice = data.data.getTokenPrice.tokens;
    objPrice.forEach(
      (item: { usd: number; symbol: string }) => (obj[item.symbol] = item.usd)
    );
    return obj || {};
  } catch (error) {
    captureError(error);
    return {};
  }
};

export const formatAmountWithDecimals = (
  amount = 0,
  decimals = 0,
  assetDecimals = 0
) => {
  return Number((amount / 10 ** assetDecimals).toFixed(decimals));
};

export const formatStringAmountWithDecimals = (amount = "", decimals = 0) => {
  const [_amount, _decimals] = amount.split(".");

  if (!_decimals) return amount;

  const _newDecimals = (_decimals || "").substr(0, decimals);

  return `${_amount}.${_newDecimals}`;
};

export const formatBN = (bn: string, decimals = 1, fixed?: null | number) => {
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
    _number = _number.slice(0, _number.length - 1);
  }

  if (_number.startsWith(".")) {
    _number = `0${_number}`;
  }

  if (fixed && _number.includes(".")) {
    const [integer, decimal] = _number.split(".");
    _number = `${integer}.${decimal.slice(0, fixed)}`;
  }

  return _number;
};

export const formatUSDAmount = (amount: number) => {
  const currencyInfo = getCurrencyInfo();
  const currencySymbol = currencyInfo.symbol;
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: currencySymbol,
    maximumFractionDigits: 6,
  });
};

export const transformAmountStringToBN = (amount: string, decimals: number) => {
  try {
    const [amountWithoutDot, dotAmount] = amount.split(".");
    const _dotAmount = dotAmount || "";
    const missingUnits = decimals - _dotAmount.length;
    const amountWithMissingUnits = `${amountWithoutDot}${_dotAmount}${"0".repeat(
      missingUnits
    )}`;

    const amountBN = new BN(amountWithMissingUnits);
    return amountBN;
  } catch (error) {
    return new BN("0");
  }
};

export const transformAmountStringToBigNumber = (
  amount: string,
  decimals: number
) => {
  try {
    const [amountWithoutDot, dotAmount] = amount.split(".");
    const _dotAmount = dotAmount || "";
    const missingUnits = decimals - _dotAmount.length;
    const amountWithMissingUnits = `${amountWithoutDot}${_dotAmount}${"0".repeat(
      missingUnits
    )}`;

    const amountBN = new BN(amountWithMissingUnits);
    return amountBN;
  } catch (error) {
    return BN0;
  }
};

export const getCurrencyInfo = () => {
  const selectedCurrency = localStorage.getItem("currency") || "usd";
  const currencyInfo = CURRENCIES.find(
    (currency) => currency.symbol === selectedCurrency
  );
  return currencyInfo ? currencyInfo : CURRENCIES[0];
};

export const getWasmAssets = async (
  api: ApiPromise,
  chainId: string,
  address: string,
  dispatch: (
    assetId: string,
    amounts: {
      balance: string;
      transferable: string;
    }
  ) => void
) => {
  const assets: Asset[] = [];
  const unsubs: unknown[] = [];
  try {
    let balanceMethod:
      | (PromiseResult<GenericStorageEntryFunction> &
          StorageEntryBase<"promise", GenericStorageEntryFunction, AnyTuple> &
          StorageEntryPromiseOverloads)
      | null = null;
    switch (chainId) {
      case "acala":
      case "mandala":
      case "hydradx":
      case "hydradx-rococo":
        balanceMethod = api.query.tokens.accounts;
        break;
      default:
        balanceMethod = api.query.assets?.account;
        break;
    }
    if (!balanceMethod){
      return {
        assets,
        unsubs,
      };}

    const mappedAssets = SUBSTRATE_ASSETS_MAP[chainId] || [];
    const assetBalances = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mappedAssets.map((asset: any) => {
        const params = [];
        if (["acala", "mandala","hydradx", "hydradx-rococo"].includes(chainId.toLowerCase())) {
          params.push(address, asset.id);
        } else {
          params.push(asset.id, address);
        }
        
        return balanceMethod?.(...params);
      })
    );
    assetBalances.forEach((data, index) => {
      const asset = mappedAssets[index];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const balance = getSubtrateNonNativeBalance(data as any);
      assets.push({
        ...asset,
        id: typeof asset.id === "object" ? JSON.stringify(asset.id) : asset.id,
        ...balance,
      });
    });
    await Promise.all(
      assets.map(async (asset) => {
        const params = [];
        if (["acala", "mandala", "hydradx", "hydradx-rococo"].includes(chainId.toLowerCase())) {
          params.push(address, JSON.parse(asset.id));
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
): {
  balance: string;
  transferable: string;
} => {
  if (!data) {
    return {
      balance: BN0.toString(),
      transferable: BN0.toString(),
    };
  }

  const free = new BN(String(data?.free || 0));
  const reserved = new BN(String(data?.reserved || 0));
  const miscFrozen = new BN(String(data?.miscFrozen || data?.frozen || 0));
  const feeFrozen = new BN(String(data?.feeFrozen || 0));
  const frozen = miscFrozen.add(feeFrozen);
  const transferable = free.sub(frozen).sub(reserved);

  return {
    balance: free.toString(),
    transferable: transferable.toString(),
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
      balance: BN0.toString(),
      transferable: BN0.toString(),
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
    balance: balance.toString(),
    transferable: balance.sub(frozen).sub(reserved).toString(),
  };
};

export const formatFees = (fees: string, decimals: number) => {
  const formated = formatBN(fees, decimals, 6);

  const _decimals = formated.split(".")[1] || "";
  const threeFirstDecimals = _decimals.slice(0, 3);

  if (threeFirstDecimals === "000") {
    return formated;
  }

  const amount = formated.split(".")[0];
  return `${amount}.${threeFirstDecimals}`;
};
