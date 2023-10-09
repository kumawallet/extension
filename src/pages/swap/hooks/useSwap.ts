import { useEffect, useMemo, useState } from "react";
import {
  TradeRouter,
  PoolService,
  PoolType,
  BalanceClient,
} from "@galacticcouncil/sdk";
import { useAccountContext, useNetworkContext } from "@src/providers";
import { ApiPromise } from "@polkadot/api";
import { decodeAddress } from "@polkadot/util-crypto";
import { BN } from "@polkadot/util";
import { formatBN } from "@src/utils/assets";

interface Asset {
  image?: string;
  label: string;
  id?: string;
  balance: string;
  decimals: number;
}

export interface TxInfoState {
  bridgeName: string;
  bridgeFee: string;
  gasFee: string;
  destinationAddress: string;
}

export const useSwap = () => {
  const {
    state: { api },
  } = useNetworkContext();

  const {
    state: { selectedAccount },
  } = useAccountContext();

  const [assets, setAssets] = useState<Asset[]>([]);

  const [assetToSell, setAssetToSell] = useState<Asset>({
    label: "",
    balance: new BN("0").toString(),
    decimals: 0,
  });
  const [assetToBuy, setAssetToBuy] = useState<Asset>({
    label: "",
    balance: new BN("0").toString(),
    decimals: 0,
  });

  const [recipient, setRecipient] = useState({
    isNotOwnAddress: false,
    address: "",
  });

  const [txInfo, setTxInfo] = useState<TxInfoState>({
    bridgeName: "HydraDX",
    bridgeFee: "0",
    gasFee: "0",
    destinationAddress: "",
  });

  const [amounts, setAmounts] = useState({
    sell: new BN("0"),
    buy: new BN("0"),
  });

  const [tradeRouter, setTradeRouter] = useState<TradeRouter | null>(null);

  const init = async (api: ApiPromise) => {
    const poolService = new PoolService(api);
    const balanceClient = new BalanceClient(api);
    const tradeRouter = new TradeRouter(poolService, {
      includeOnly: [PoolType.Omni],
    });

    setTradeRouter(tradeRouter);

    const result = await tradeRouter.getAllAssets();

    const assetsWithBalance = await Promise.all(
      result.map(async (asset) => {
        const a =
          asset.id === "0"
            ? await balanceClient.getAccountBalance(
                selectedAccount.value.address,
                asset.id
              )
            : await balanceClient.getTokenAccountBalance(
                selectedAccount.value.address,
                asset.id
              );
        const b = await balanceClient.getAssetMetadata(asset.id);
        return {
          ...asset,
          balance: "amount" in a ? a.amount.toString() : a.toString() || "0",
          decimals: b.decimals,
        };
      })
    );

    setAssets(
      assetsWithBalance.map((asset) => ({
        label: asset.symbol,
        id: asset.id,
        image: asset.symbol,
        balance: asset.balance,
        decimals: asset.decimals,
      }))
    );

    const assetToSell = assetsWithBalance.find((asset) => asset.id === "0")!;
    // const assetToSell = assetsWithBalance[0];

    setAssetToSell({
      label: assetToSell.symbol,
      id: assetToSell.id,
      image: assetToSell.symbol,
      balance: assetToSell.balance,
      decimals: assetToSell.decimals,
    });

    const assetToBuy = assetsWithBalance.find(
      (asset) => asset.symbol.toLowerCase() === "astr"
    )!;
    // const assetToBuy = assetsWithBalance[1];

    setAssetToBuy({
      label: assetToBuy.symbol,
      id: assetToBuy.id,
      image: assetToBuy.symbol,
      balance: assetToBuy.balance,
      decimals: assetToBuy.decimals,
    });
  };

  const isValidWASMAddress = useMemo(() => {
    const { address, isNotOwnAddress } = recipient;

    if (!isNotOwnAddress || !address.trim()) return true;

    try {
      decodeAddress(address);
      return true;
    } catch (error) {
      return false;
    }
  }, [recipient]);

  const handleRecipientChange = (label: string, value: unknown) => {
    setRecipient((prevState) => ({
      ...prevState,
      [label]: value,
    }));
  };

  const handleAmounts = async (label: "sell" | "buy", value: string) => {
    const firstAssetId = label === "sell" ? assetToSell.id : assetToBuy.id;
    const secondAssetId = label === "sell" ? assetToBuy.id : assetToSell.id;

    const _sellResult = await tradeRouter?.getBestSell(
      firstAssetId!,
      secondAssetId!,
      new BN(value).toString()
    );

    const { amountOut, tradeFee } = _sellResult?.toHuman() || {
      amountOut: "0",
      tradeFee: "0",
    };

    setAmounts((prevState) => ({
      ...prevState,
      [label]: new BN(value),
      [label === "sell" ? "buy" : "sell"]: formatBN(
        amountOut,
        label === "sell" ? assetToBuy.decimals : assetToSell.decimals
      ),
    }));

    setTxInfo((prevState) => ({
      ...prevState,
      gasFee: (tradeFee as string).slice(0, 6),
    }));
  };

  const handleAssetChange = (label: "sell" | "buy", asset: Asset) => {
    if (label === "sell") {
      setAssetToSell(asset);

      if (assetToBuy.id === asset.id) {
        setAssetToBuy(assets.find((a) => a.id !== asset.id) as Asset);
      }
    } else {
      setAssetToBuy(asset);

      if (assetToSell.id === asset.id) {
        setAssetToSell(assets.find((a) => a.id !== asset.id) as Asset);
      }
    }
  };

  useEffect(() => {
    if (!api) return;

    init(api);
  }, [api]);

  return {
    assets,
    assetToSell,
    setAssetToSell,
    assetToBuy,
    setAssetToBuy,
    isValidWASMAddress,
    handleRecipientChange,
    txInfo,
    recipient,
    amounts,
    handleAmounts,
    handleAssetChange,
  };
};
