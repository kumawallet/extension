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
import { ApiPromise } from "@polkadot/api";
import { ethers } from "ethers";
import { StealthEX } from "../stealthEX";
import { ActiveSwaps, SwapAsset, Swapper } from "../base";
import { getWebAPI } from "@src/utils/env";
import { useNavigate } from "react-router-dom";
import { BALANCE } from "@src/routes/paths";
import { useTranslation } from "react-i18next";

export interface TxInfoState {
  bridgeName: string;
  bridgeFee: string;
  gasFee: string | null;
  destinationAddress: string | null;
}

const WebAPI = getWebAPI();

export const useSwap = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("swap");

  const {
    state: { api, selectedChain, rpc },
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
  const {
    isLoading: isLoadingSellPairs,
    starLoading: starLoadingSellPairs,
    endLoading: endLoadingSellPairs,
  } = useLoading();

  const { showErrorToast, showSuccessToast } = useToast();

  const [assets, setAssets] = useState<SwapAsset[]>([]);

  const [assetToSell, setAssetToSell] = useState<Partial<SwapAsset>>({
    label: "",
    balance: new BN("0").toString(),
    decimals: 0,
    symbol: "",
  });
  const [assetsToSell, setAssetsToSell] = useState<SwapAsset[]>([]);

  const [assetToBuy, setAssetToBuy] = useState<Partial<SwapAsset>>({
    label: "",
    balance: new BN("0").toString(),
    decimals: 0,
    symbol: "",
  });
  const [assetsToBuy, setAssetsToBuy] = useState<SwapAsset[]>([]);

  const [recipient, setRecipient] = useState({
    isNotOwnAddress: false,
    address: "",
  });

  const [txInfo, setTxInfo] = useState<TxInfoState>({
    bridgeName: "",
    bridgeFee: "",
    gasFee: null,
    destinationAddress: null,
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
    swapId: "",
  });

  const [amounts, setAmounts] = useState({
    sell: "0",
    buy: "0",
  });

  const [minSellAmount, setMinSellAmount] = useState<string | null>(null);

  const [activeSwaps, setActiveSwaps] = useState<ActiveSwaps[]>([]);

  const [swapper, setSwapper] = useState<Swapper | null>(null);

  const [mustConfirmTx, setMustConfirmTx] = useState(false);

  const init = async (api: ApiPromise | ethers.providers.JsonRpcProvider) => {
    starLoading();
    try {
      const nativeCurrency =
        selectedChain?.nativeCurrency.symbol?.toLowerCase();
      const chainName = selectedChain?.name;

      const _swapper = new StealthEX();

      setTxInfo((prevState) => ({
        ...prevState,
        bridgeName: _swapper.protocol,
        bridgeFee: _swapper.bridgeFee,
      }));

      const { nativeAssets, pairs } = await _swapper.init({
        nativeCurrency,
        chainName,
        api,
      });

      setAssets([...nativeAssets]);

      setAssetToSell(nativeAssets[0]);
      setAssetsToSell(nativeAssets);

      // setAssetToBuy(pairs[0]);
      // setAssetsToBuy(pairs);
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
        from: (assetToSell.symbol || "")?.toLowerCase(),
        to: (assetToBuy.symbol || "")?.toLowerCase(),
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

  const handleAssetChange = (label: "sell" | "buy", asset: SwapAsset) => {
    if (label === "sell") {
      setAssetToSell(asset);

      if (assetToBuy.symbol === asset.symbol) {
        setAssetToBuy(
          assetsToBuy.find((a) => a.symbol !== asset.symbol) as SwapAsset
        );
      }
    } else {
      setAssetToBuy(asset);

      if (assetToSell.symbol === asset.symbol) {
        setAssetToSell(
          assetsToSell.find((a) => a.symbol !== asset.symbol) as SwapAsset
        );
      }
    }
  };

  const setMaxAmout = () => {
    try {
      const amount = assetToSell.balance?.toString();
      const formatedAmount = formatBN(amount || "", assetToSell.decimals);

      setAmounts((prevState) => ({
        ...prevState,
        sell: formatedAmount,
      }));

      handleAmounts("sell", formatedAmount);
    } catch (error) {
      showErrorToast("error_setting_max_amount");
      captureError(error);
    }
  };

  const swap = async () => {
    starLoading();
    try {
      const { destination, fee, id } = await swapper!.createSwap({
        currencyFrom: assetToSell.symbol as string,
        currencyDecimals: assetToSell.decimals as number,
        currencyTo: assetToBuy.symbol as string,
        amountFrom: amounts.sell,
        addressTo: recipient.address,
        nativeAsset: selectedChain?.nativeCurrency,
        assetToSell: {
          symbol: assetToSell.label as string,
          decimals: assetToSell.decimals as number,
        },
      });

      const isNeededToConfirmTx = swapper!.mustConfirmTx();

      if (!isNeededToConfirmTx) {
        showSuccessToast("Swap successful");
        loadActiveSwaps();
        return;
      }

      const tx = {
        swapId: id,
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
          symbol: (assetToSell.label || "").toLocaleUpperCase(),
          image: assetToSell.image || "",
        },
        assetTo: {
          symbol: (assetToSell.label || "").toLocaleUpperCase(),
          image: assetToSell.image || "",
        },
        fee,
      };

      setTx(tx);

      setMustConfirmTx(swapper!.mustConfirmTx());

      // clean amounts
      // setMinSellAmount(null);
      // setAmounts((prevState) => ({
      //   ...prevState,
      //   sell: "0",
      //   buy: "0",
      // }));
    } catch (error) {
      captureError(error);
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
      setActiveSwaps(activeSwaps);
    } catch (error) {
      showErrorToast("error_fetching_swaps");
    }
    endLoadingActiveSwaps();
  };

  const onConfirmTx = async () => {
    if (!swapper) return;
    starLoading();
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const txToSend: any = {
        amount: amounts.sell,
        originAddress: selectedAccount.value.address,
        destinationAddress: tx.addressTo,
        rpc: rpc as string,
        asset: assetToSell,
        destinationNetwork: selectedChain?.name,
        networkInfo: selectedChain,
        originNetwork: selectedChain,
        tx: {
          type: "",
          txHash: "",
        },
      };

      const isConfirmNeeded = swapper.mustConfirmTx();

      if (isConfirmNeeded) {
        const assetToTransfer = _assets.find(
          (asset) => asset.symbol === assetToSell.label
        )!;

        const { txHash, type } = await swapper.confirmTx({
          assetToTransfer: {
            id: assetToTransfer.id,
            address: assetToTransfer.address || "",
            decimals: assetToTransfer.decimals,
          },
          amount: amounts.sell,
          destinationAccount: tx.addressTo,
        });

        const { id } = await WebAPI.windows.getCurrent();

        txToSend.tx = {
          type,
          txHash,
        };

        await WebAPI.runtime.sendMessage({
          from: "popup",
          origin: "kuma",
          method: "process_tx",
          popupId: id,
          tx: txToSend,
        });

        showSuccessToast(t("tx_send"));
        await swapper.saveSwapInStorage(tx.swapId);
        navigate(BALANCE, {
          state: {
            tab: "activity",
          },
        });
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const _error: any = error;
      showErrorToast(
        _error?.body || _error?.error?.message || _error.message || error
      );
      captureError(error);
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
    let isSufficient = false;

    if (assetToSell?.balance) {
      const assetBalance = new BN(assetToSell.balance.toString());
      const amountBalance = transformAmountStringToBN(
        amounts.sell,
        assetToSell.decimals || 0
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
    (async () => {
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

        starLoadingSellPairs();
        setAssetsToBuy([]);
        setAssetToBuy({
          label: "",
          balance: new BN("0").toString(),
          decimals: 0,
          symbol: "",
        });
        const pairs = await swapper!.getPairs(assetToSell.symbol as string);
        if (pairs.length > 0) {
          setAssetsToBuy(pairs);
          setAssetToBuy(pairs[0]);
        }
        endLoadingSellPairs();
      }
    })();
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
    isLoadingSellPairs,
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
