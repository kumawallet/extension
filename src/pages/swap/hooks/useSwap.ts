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
import { StealthEX } from "../stealthEX";
import { SwapAsset, Swapper } from "../base";
import { useNavigate } from "react-router-dom";
import { BALANCE } from "@src/routes/paths";
import { useTranslation } from "react-i18next";
import { messageAPI } from "@src/messageAPI/api";
import { getAccountType } from "@src/utils/account-utils";
import Account from "@src/storage/entities/Account";
import { Chain } from "@src/types";

export interface TxInfoState {
  bridgeType: string;
  bridgeName: string;
  bridgeFee: string;
  gasFee: string | null;
  destinationAddress: string | null;
}

export interface Tx {
  addressBridge: string;
  addressFrom: string;
  addressTo: string;
  amountBridge: string;
  amountFrom: string;
  amountTo: string;
  chainBridge: {
    name: string;
    image: string;
  };
  chainFrom: {
    name: string;
    image: string;
  };
  chainTo: {
    name: string;
    image: string;
  };
  assetBridge: {
    symbol: string;
    image: string;
    decimals: number;
  };
  assetFrom: {
    symbol: string;
    image: string;
    decimals: number;
  };
  assetTo: {
    symbol: string;
    image: string;
    isAproximate: boolean;
  };
  fee: {
    estimatedFee: string;
    estimatedTotal: string;
  };
  swapId: string;
}

export const useSwap = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("swap");

  const {
    state: { selectedChain, chains },
  } = useNetworkContext();

  const {
    state: { accounts, selectedAccount },
  } = useAccountContext();

  const {
    state: { assets: _assets },
  } = useAssetContext();

  const { isLoading, starLoading, endLoading } = useLoading();
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
    isLoading: isCreatingSwap,
    starLoading: starCreatingSwap,
    endLoading: endCreatingSwap,
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
    bridgeType: "",
    bridgeName: "",
    bridgeFee: "",
    gasFee: null,
    destinationAddress: null,
  });

  const [tx, setTx] = useState<Tx>({
    addressBridge: "",
    addressFrom: "",
    addressTo: "",
    amountBridge: "",
    amountFrom: "",
    amountTo: "",
    chainBridge: {
      name: "",
      image: "",
    },
    chainFrom: {
      name: "",
      image: "",
    },
    chainTo: {
      name: "",
      image: "",
    },
    assetBridge: {
      symbol: "",
      image: "",
      decimals: 0,
    },
    assetFrom: {
      symbol: "",
      image: "",
      decimals: 0,
    },
    assetTo: {
      symbol: "",
      image: "",
      isAproximate: true,
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

  const [isPairValid, setIsPairValid] = useState(true);

  const [minSellAmount, setMinSellAmount] = useState<string | null>(null);

  const [swapper, setSwapper] = useState<Swapper | null>(null);

  const [mustConfirmTx, setMustConfirmTx] = useState(false);

  const [sellBalanceError, setSellBalanceError] = useState<string | null>(null);

  const init = async (selectedAccount: Account) => {
    starLoading();
    try {
      const accountType = getAccountType(selectedAccount!.type)?.toLowerCase();

      const firstChainId = Object.keys(selectedChain).find((chainId) => {
        return selectedChain[chainId].type === accountType;
      });

      const allChains = chains.map((chain) => chain.chains).flat();

      if (firstChainId) {
        const chainIds = allChains
          .filter((chain) => chain.type === accountType)
          .map((chain) => chain.id);

        const _swapper = new StealthEX();

        setTxInfo((prevState) => ({
          ...prevState,
          bridgeType: _swapper.type,
          bridgeName: _swapper.protocol,
          bridgeFee: _swapper.bridgeFee,
        }));

        const { nativeAssets, pairs } = await _swapper!.init({
          chainIds: chainIds,
        });

        setAssets(nativeAssets);
        if (assetToSell.label === "") setAssetToSell(nativeAssets[0]);
        setAssetsToSell(nativeAssets);
        setAssetsToBuy(pairs);
        setAssetToBuy(pairs[1]);
        setSwapper(_swapper);
      }
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

      setIsPairValid(estimatedAmount !== "0");

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
      const amount = assetToSell?.balance?.toString();
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

  const setSenderAddress = async (address: string) => {
    setTx((prevState) => ({
      ...prevState,
      addressFrom: address,
    }));
  };

  const swap = async () => {
    starCreatingSwap();
    try {
      const { destination, fee, id } = await swapper!.createSwap({
        currencyFrom: assetToSell.symbol as string,
        currencyDecimals: assetToSell.decimals as number,
        currencyTo: assetToBuy.symbol as string,
        amountFrom: amounts.sell,
        addressFrom: tx.addressFrom,
        addressTo: recipient.address,
        nativeAsset: {
          symbol: assetToSell.label as string,
          decimals: assetToSell.decimals as number,
        },
        assetToSell: {
          symbol: assetToSell.label as string,
          decimals: assetToSell.decimals as number,
        },
      });

      const isNeededToConfirmTx = swapper!.mustConfirmTx();
      if (!isNeededToConfirmTx) {
        showSuccessToast("Swap successful");
        return;
      }

      // @ts-expect-error --- *
      const chainId = assetToSell.chainId as string;

      const allChains = chains.map((chain) => chain.chains).flat();

      const chain = allChains.find((chain) => chain.id === chainId) as Chain;

      const updateTx: Tx = {
        swapId: id,
        addressBridge: destination,
        addressFrom: tx.addressFrom,
        addressTo: recipient.address,
        amountFrom: amounts.sell,
        amountTo: amounts.buy,
        amountBridge: amounts.sell,
        chainFrom: {
          name: chain.name,
          image: chain.logo,
        },
        chainBridge: {
          name: chain.name,
          image: chain.logo,
        },
        chainTo: {
          name: "",
          image: assetToBuy.image || "",
        },
        assetFrom: {
          symbol: (assetToSell.label || "").toLocaleUpperCase(),
          image: assetToSell.image || "",
          decimals: assetToSell.decimals || 0,
        },
        assetBridge: {
          symbol: (assetToSell.label || "").toLocaleUpperCase(),
          image: assetToSell.image || "",
          decimals: assetToSell.decimals || 0,
        },
        assetTo: {
          symbol: (assetToBuy.label || "").toLocaleUpperCase(),
          image: assetToBuy.image || "",
          isAproximate: true,
        },
        fee,
      };
      setTx(updateTx);

      await messageAPI.updateTx({
        tx: {
          amount: amounts.sell,
          senderAddress: tx.addressFrom,
          destinationAddress: recipient.address,
          originNetwork: chain,
          targetNetwork: chain,
          asset: {
            id: assetToSell.id as string,
            symbol: assetToSell.symbol || "",
            balance: assetToSell.balance || "",
            decimals: assetToSell.decimals || 0,
            address: assetToSell.address || "",
          },
        },
      });

      setMustConfirmTx(swapper!.mustConfirmTx());
      // clean amounts
      setMinSellAmount(null);
      setAmounts((prevState) => ({
        ...prevState,
        sell: "0",
        buy: "0",
      }));
    } catch (error) {
      captureError(error);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      showErrorToast(error.response?.data?.message || error?.message || error);
    }

    endCreatingSwap();
  };

  const onBack = () => {
    setMustConfirmTx(false);
  };

  const onConfirmTx = async () => {
    if (!swapper) return;
    starLoading();
    try {
      const isConfirmNeeded = swapper.mustConfirmTx();

      if (isConfirmNeeded) {
        await messageAPI.sendTx();

        showSuccessToast(t("tx_send"));
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
      const assetBalance = new BN(assetToSell?.balance.toString() || "0");
      const amountBalance = transformAmountStringToBN(
        amounts.sell,
        assetToSell.decimals || 0
      );

      isSufficient = assetBalance.gte(amountBalance);
      !isSufficient && setSellBalanceError("insufficient_balance");
    }

    if (isSufficient && minSellAmount) {
      isSufficient =
        Number(amounts.sell) < Number(minSellAmount) ? false : true;
      !isSufficient && setSellBalanceError("min_amount_error");
    }

    isSufficient && setSellBalanceError(null);
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

      const accountKey = Object.keys(_assets).find((key) =>
        key.toLowerCase().includes(tx.addressFrom.toLowerCase())
      );

      const allAssets = Object.values(_assets[accountKey as string]).flatMap(
        // @ts-expect-error --- *

        (a) => a.assets
      );

      if (allAssets.length > 0) {
        const selectedAsset = allAssets.find(
          (asset) => asset.symbol === assetToSell.label
        );

        if (!selectedAsset) return;

        setAssetToSell((prevState) => ({
          ...prevState,
          balance: selectedAsset?.balance,
          decimals: selectedAsset?.decimals,
        }));
      }
    })();
  }, [assetToSell?.label, _assets, tx.addressFrom]);

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
    if (!tx.addressFrom) return;

    const account = accounts.find(
      (account) => account.value!.address === tx.addressFrom
    );

    if (!account) return;

    init(account);
  }, [tx.addressFrom, accounts]);

  useEffect(() => {
    if (selectedAccount?.value) {
      setTx((prevState) => ({
        ...prevState,

        addressFrom: selectedAccount.value!.address,
      }));
    }
  }, [selectedAccount]);

  return {
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
    isCreatingSwap,
    isLoading,
    isLoadingBuyAsset,
    isLoadingSellAsset,
    // isLoadingSellPairs,
    isValidWASMAddress,
    minSellAmount,
    mustConfirmTx,
    onBack,
    onConfirmTx,
    recipient,
    sellBalanceError,
    setAssetToBuy,
    setAssetToSell,
    setMaxAmout,
    showRecipientAddress,
    swap,
    swapInfoMessage,
    tx,
    txInfo,
    setSenderAddress,
    isPairValid,
  };
};
