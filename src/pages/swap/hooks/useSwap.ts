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
import { formatBN, transformAmountStringToBN } from "@src/utils/assets";
import { useLoading, useToast } from "@src/hooks";
import Extension from "@src/Extension";
import { Keyring } from "@polkadot/api";
import { useNavigate } from "react-router-dom";
import { BALANCE } from "@src/routes/paths";
import { captureError } from "@src/utils/error-handling";
import { TxToProcess } from "@src/types";
import { AccountType } from "@src/accounts/types";
import { getWebAPI } from "@src/utils/env";

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

const WebAPI = getWebAPI();

export const useSwap = () => {
  const navigate = useNavigate();

  const {
    state: { api, rpc, selectedChain },
  } = useNetworkContext();

  const {
    state: { selectedAccount },
  } = useAccountContext();

  const { isLoading, starLoading, endLoading } = useLoading();
  const { showErrorToast, showSuccessToast } = useToast();

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
    destinationAddress: selectedAccount.value.address,
  });

  const [amounts, setAmounts] = useState({
    sell: "0",
    buy: "0",
  });

  const [tradeRouter, setTradeRouter] = useState<TradeRouter | null>(null);

  const init = async (api: ApiPromise) => {
    starLoading();
    try {
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
    } catch (error) {
      showErrorToast("Error fetching assets");
      captureError(error);
    }
    endLoading();
  };

  const handleRecipientChange = (label: string, value: unknown) => {
    setRecipient((prevState) => ({
      ...prevState,
      [label]: value,
    }));
  };

  const handleAmounts = async (label: "sell" | "buy", value: string) => {
    setAmounts((prevState) => ({
      ...prevState,
      [label]: value,
    }));

    const firstAssetId = label === "sell" ? assetToSell.id : assetToBuy.id;
    const secondAssetId = label === "sell" ? assetToBuy.id : assetToSell.id;

    const _sellResult = await tradeRouter?.getBestSell(
      firstAssetId!,
      secondAssetId!,
      value
    );

    const { amountOut, tradeFee } = _sellResult?.toHuman() || {
      amountOut: "0",
      tradeFee: "0",
    };

    setAmounts((prevState) => ({
      ...prevState,
      [label === "sell" ? "buy" : "sell"]: amountOut,
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

  const setMaxAmout = () => {
    const balance = new BN(assetToSell.balance);
    const amount = balance.toString();

    const formatedAmount = formatBN(amount, assetToSell.decimals);

    setAmounts((prevState) => ({
      ...prevState,
      sell: formatedAmount,
    }));

    handleAmounts("sell", formatedAmount);
  };

  const swap = async () => {
    starLoading();
    try {
      const extrinsic = (api as ApiPromise).tx.omnipool.sell(
        assetToSell.id,
        assetToBuy.id,
        transformAmountStringToBN(
          amounts.sell,
          assetToSell.decimals
        ).toString(),
        transformAmountStringToBN(amounts.buy, assetToBuy.decimals).toString()
      );

      const seed = await Extension.showKey();
      const keyring = new Keyring({ type: "sr25519" });
      const sender = keyring.addFromMnemonic(seed as string);

      const signedTx = await extrinsic.signAsync(sender);

      const txToSend: Partial<TxToProcess> = {
        amount: amounts.sell,
        originAddress: selectedAccount.value.address,
        destinationAddress: selectedAccount.value.address,
        rpc: rpc as string,
        asset: {
          symbol: assetToSell.label,
          id: assetToSell.id as string,
          decimals: assetToSell.decimals,
          balance: assetToSell.balance,
        },
        destinationNetwork: selectedChain.name,
        networkInfo: selectedChain,
        originNetwork: selectedChain,
        tx: {
          txHash: signedTx.toHex(),
          type: AccountType.WASM,
        },
      };

      const { id } = await WebAPI.windows.getCurrent();

      await WebAPI.runtime.sendMessage({
        from: "popup",
        origin: "kuma",
        method: "process_tx",
        popupId: id,
        tx: txToSend,
      });

      showSuccessToast("Swap successful");
      navigate(BALANCE);
    } catch (error) {
      showErrorToast(error);
    }

    endLoading();
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

  const balanceIsSufficient = useMemo(() => {
    const balance = new BN(assetToSell.balance);

    const amount = transformAmountStringToBN(
      amounts.sell,
      assetToSell.decimals
    );

    return balance.gte(amount);
  }, [assetToSell?.balance, amounts?.sell]);

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
    swap,
    isLoading,
    balanceIsSufficient,
    setMaxAmout,
  };
};
