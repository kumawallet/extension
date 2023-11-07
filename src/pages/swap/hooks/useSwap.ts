import { useEffect, useMemo, useState } from "react";
import {
  useAccountContext,
  useAssetContext,
  useNetworkContext,
} from "@src/providers";
import { decodeAddress } from "@polkadot/util-crypto";
import { BN } from "@polkadot/util";
import { formatBN, transformAmountStringToBN } from "@src/utils/assets";
import { useLoading, useToast } from "@src/hooks";
import { captureError } from "@src/utils/error-handling";
// import { getWebAPI } from "@src/utils/env";
import { ApiPromise } from "@polkadot/api";
import { ethers } from "ethers";
import { StealthEX } from "../stealthEX";
import { ActiveSwaps, Swapper } from "../base";

interface Asset {
  image?: string;
  label: string;
  id?: string;
  balance: string;
  decimals: number;
  symbol: string;
}

export interface TxInfoState {
  bridgeName: string;
  bridgeFee: string;
  gasFee: string;
  destinationAddress: string;
}

// const WebAPI = getWebAPI();

export const useSwap = () => {
  const {
    state: { api, selectedChain },
  } = useNetworkContext();

  const {
    state: { selectedAccount },
  } = useAccountContext();

  const {
    state: { assets: _assets },
  } = useAssetContext();

  const { isLoading, starLoading, endLoading } = useLoading();
  const {
    isLoading: isLoadingActiveSwaps,
    starLoading: starLoadingActiveSwaps,
    endLoading: endLoadingActiveSwaps,
  } = useLoading();
  const {
    isLoading: isLoadingBuyAsset,
    starLoading: starLoadingBuyAsset,
    endLoading: endLoadingBuyAsset,
  } = useLoading();
  const {
    isLoading: isLoadingSellAsset,
    starLoading: starLoadingSellAsset,
    endLoading: endLoadingSellAsset,
  } = useLoading();

  const { showErrorToast, showSuccessToast } = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);

  const [assetToSell, setAssetToSell] = useState<Asset>({
    label: "",
    balance: new BN("0").toString(),
    decimals: 0,
    symbol: "",
  });
  const [assetsToSell, setAssetsToSell] = useState<Asset[]>([]);

  const [assetToBuy, setAssetToBuy] = useState<Asset>({
    label: "",
    balance: new BN("0").toString(),
    decimals: 0,
    symbol: "",
  });
  const [assetsToBuy, setAssetsToBuy] = useState<Asset[]>([]);

  const [recipient, setRecipient] = useState({
    isNotOwnAddress: false,
    address: "",
  });

  const [txInfo, setTxInfo] = useState<TxInfoState>({
    bridgeName: "SteatlhEX",
    bridgeFee: "0",
    gasFee: "0",
    destinationAddress: "",
  });

  const [tx, setTx] = useState({
    addressFrom: "",
    addressTo: "",
    amountFrom: "",
    amountTo: "",
    chainFrom: {
      name: "",
      image: "",
    },
    chainTo: {
      name: "",
      image: "",
    },
    assetFrom: {
      symbol: "",
      image: "",
    },
    assetTo: {
      symbol: "",
      image: "",
    },
    fee: {
      estimatedFee: "0",
      estimatedTotal: "0",
    },
  });

  const [amounts, setAmounts] = useState({
    sell: "0",
    buy: "0",
  });

  const [minSellAmount, setMinSellAmount] = useState<string | null>(null);

  const [activeSwaps, setActiveSwaps] = useState<ActiveSwaps[]>([]);

  // const [tradeRouter, setTradeRouter] = useState<null>(null);

  const [swapper, setSwapper] = useState<Swapper | null>(null);

  // const showRecipientAddress = stealthEX.showRecipentAddressFormat();

  const [mustConfirmTx, setMustConfirmTx] = useState(false);

  const init = async (api: ApiPromise | ethers.providers.JsonRpcProvider) => {
    starLoading();
    try {
      const nativeCurrency =
        selectedChain?.nativeCurrency.symbol?.toLowerCase();
      const chainName = selectedChain?.name;

      const _swapper = new StealthEX();

      const { nativeAssets, pairs } = await _swapper.init({
        nativeCurrency,
        chainName,
        api,
      });

      setAssets([...pairs, ...nativeAssets]);

      setAssetToSell(nativeAssets[0]);
      setAssetsToSell(nativeAssets);

      setAssetToBuy(pairs[0]);
      setAssetsToBuy(pairs);
      setSwapper(_swapper);
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
    try {
      setAmounts((prevState) => ({
        ...prevState,
        [label]: value,
      }));

      label === "sell" ? starLoadingBuyAsset() : starLoadingSellAsset();

      const { estimatedAmount, minAmount } = await swapper!.getEstimatedAmount({
        from: assetToSell.symbol?.toLowerCase(),
        to: assetToBuy.symbol?.toLowerCase(),
        amount: value,
      });

      setMinSellAmount(minAmount);

      setAmounts((prevState) => ({
        ...prevState,
        [label === "sell" ? "buy" : "sell"]: estimatedAmount,
      }));

      label === "sell" ? endLoadingBuyAsset() : endLoadingSellAsset();
    } catch (error) {
      showErrorToast("error_estimating_amount");
    }
  };

  const handleAssetChange = (label: "sell" | "buy", asset: Asset) => {
    if (label === "sell") {
      setAssetToSell(asset);

      if (assetToBuy.symbol === asset.symbol) {
        setAssetToBuy(
          assetsToBuy.find((a) => a.symbol !== asset.symbol) as Asset
        );
      }
    } else {
      setAssetToBuy(asset);

      if (assetToSell.symbol === asset.symbol) {
        setAssetToSell(
          assetsToSell.find((a) => a.symbol !== asset.symbol) as Asset
        );
      }
    }
  };

  const setMaxAmout = () => {
    try {
      const amount = assetToSell.balance.toString();
      const formatedAmount = formatBN(amount, assetToSell.decimals);

      setAmounts((prevState) => ({
        ...prevState,
        sell: formatedAmount,
      }));

      handleAmounts("sell", formatedAmount);
    } catch (error) {
      console.log(error);
    }
  };

  const swap = async () => {
    starLoading();
    try {
      const { destination, fee } = await swapper!.createSwap({
        currencyFrom: assetToSell.symbol,
        currencyTo: assetToBuy.symbol,
        amountFrom: amounts.sell,
        addressTo: recipient.address,
      });
      showSuccessToast("Swap successful");
      loadActiveSwaps();

      const tx = {
        addressFrom: selectedAccount.value.address,
        addressTo: destination,
        amountFrom: amounts.sell,
        amountTo: amounts.sell,
        chainFrom: {
          name: selectedChain?.name || "",
          image: `/images/${selectedChain.logo}.png`,
        },
        chainTo: {
          name: selectedChain?.name || "",
          image: `/images/${selectedChain.logo}.png`,
        },
        assetFrom: {
          symbol: assetToSell.label.toLocaleUpperCase(),
          image: assetToSell.image || "",
        },
        assetTo: {
          symbol: assetToSell.label.toLocaleUpperCase(),
          image: assetToSell.image || "",
        },
        estimatedFee: fee.estimatedFee.toString(),
        estimatedTotal: fee.estimatedTotal.toString(),
        fee,
      };

      setTx(tx);

      setMustConfirmTx(swapper!.mustConfirmTx());

      // clean amounts
      setMinSellAmount(null);
      setAmounts((prevState) => ({
        ...prevState,
        sell: "0",
        buy: "0",
      }));
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      showErrorToast(error.response?.data?.message || error?.message || error);
    }

    endLoading();
  };

  const onBack = () => {
    setMustConfirmTx(false);
  };

  const loadActiveSwaps = async () => {
    starLoadingActiveSwaps();
    try {
      const activeSwaps = await swapper!.getActiveSwaps();
      setActiveSwaps(
        activeSwaps.map((swap) => ({
          ...swap,
          iconFrom:
            assets.find((asset) => asset.label === swap.currencyFrom)?.image ||
            "",
          iconTo:
            assets.find((asset) => asset.label === swap.currencyTo)?.image ||
            "",
        }))
      );
    } catch (error) {
      console.log(error);
    }
    endLoadingActiveSwaps();
  };

  const onConfirmTx = async () => {
    console.log("onConfirmTx");
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
    let isSufficient = false;

    if (assetToSell?.balance) {
      const assetBalance = new BN(assetToSell.balance.toString());
      const amountBalance = transformAmountStringToBN(
        amounts.sell,
        assetToSell.decimals
      );

      isSufficient = assetBalance.gte(amountBalance);
    }

    if (isSufficient && minSellAmount) {
      isSufficient =
        Number(amounts.sell) < Number(minSellAmount) ? false : true;
    }

    return isSufficient;
  }, [assetToSell?.balance, amounts?.sell, minSellAmount]);

  const showRecipientAddress = useMemo(() => {
    return swapper?.showRecipentAddressFormat();
  }, [swapper]);

  const swapInfoMessage = useMemo(() => {
    if (!swapper) return "";

    return swapper.swap_info || "";
  }, [swapper]);

  useEffect(() => {
    if (amounts.sell !== "0") {
      handleAmounts("sell", amounts.sell);
    }

    if (_assets.length > 0) {
      const selectedAsset = _assets.find(
        (asset) => asset.symbol === assetToSell.label
      );

      if (!selectedAsset) return;

      setAssetToSell((prevState) => ({
        ...prevState,
        balance: selectedAsset.balance,
        decimals: selectedAsset.decimals,
      }));
    }
  }, [assetToSell?.label, _assets]);

  useEffect(() => {
    if (amounts.buy !== "0") {
      const canChangeSetAssetToSell = swapper!.canChangeSetAssetToSell();

      handleAmounts(
        canChangeSetAssetToSell ? "buy" : "sell",
        canChangeSetAssetToSell ? amounts.buy : amounts.sell
      );
    }
  }, [assetToBuy?.label]);

  useEffect(() => {
    if (!api) return;

    init(api);
  }, [api, _assets]);

  useEffect(() => {
    if (!swapper) return;
    loadActiveSwaps();
  }, [assets, swapper]);

  return {
    activeSwaps,
    amounts,
    assets,
    assetsToBuy,
    assetsToSell,
    assetToBuy,
    assetToSell,
    balanceIsSufficient,
    handleAmounts,
    handleAssetChange,
    handleRecipientChange,
    isLoading,
    isLoadingActiveSwaps,
    isLoadingBuyAsset,
    isLoadingSellAsset,
    isValidWASMAddress,
    minSellAmount,
    mustConfirmTx,
    onBack,
    onConfirmTx,
    recipient,
    setAssetToBuy,
    setAssetToSell,
    setMaxAmout,
    showRecipientAddress,
    swap,
    swapInfoMessage,
    tx,
    txInfo,
  };
};
