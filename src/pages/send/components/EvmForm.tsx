import { FC, useEffect, useMemo, useState } from "react";
import { AccountType } from "@src/accounts/types";
import { Loading, Button, ReEnterPassword } from "@src/components/common";
import Extension from "@src/Extension";
import { useToast } from "@src/hooks";
import {
  useAssetContext,
  useNetworkContext,
  useThemeContext,
} from "@src/providers";
import { Contract, ethers, Wallet, BigNumber } from "ethers";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { CommonFormFields } from "./CommonFormFields";
import erc20abi from "@src/constants/erc20.abi.json";
import { Fees } from "./Fees";
import { confirmTx, evmTx, EVMFee } from "@src/types";
import { BigNumber0 } from "@src/constants/assets";
import { captureError } from "@src/utils/error-handling";
import { XCM_MAPPING } from "@src/xcm/extrinsics";
import { MapResponseEVM } from "@src/xcm/interfaces";
import { ShowBalance } from "./ShowBalance";

interface EvmFormProps {
  confirmTx: confirmTx;
}

export const EvmForm: FC<EvmFormProps> = ({ confirmTx }) => {
  const { t } = useTranslation("send");
  const { t: tCommon } = useTranslation("common");
  const { color } = useThemeContext();

  const {
    state: { api, selectedChain },
  } = useNetworkContext();

  const {
    state: { assets },
  } = useAssetContext();

  const {
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useFormContext();

  const { showErrorToast } = useToast();

  const [fee, setFee] = useState<EVMFee>({
    "gas limit": BigNumber0,
    "max fee per gas": BigNumber0,
    "max priority fee per gas": BigNumber0,
    "estimated fee": BigNumber0,
    "estimated total": BigNumber0,
  });
  const [isLoadingFee, setIsLoadingFee] = useState(false);
  const [wallet, setWallet] = useState<ethers.Wallet | null>(null);
  const [evmTx, setEvmTx] = useState<evmTx | Contract | null>(null);

  const _api = api as ethers.providers.JsonRpcProvider;
  const decimals = selectedChain?.nativeCurrency.decimals || 1;
  const currencyUnits = 10 ** decimals;
  const amount = watch("amount");
  const asset = watch("asset");
  const isNativeAsset = asset?.id === "-1";
  const destinationAccount = watch("destinationAccount");
  const destinationIsInvalid = Boolean(errors?.destinationAccount?.message);

  const loadSender = async () => {
    const pk = await Extension.showKey();

    const wallet = new ethers.Wallet(
      pk as string,
      api as ethers.providers.JsonRpcProvider
    );

    setWallet(wallet);
  };

  useEffect(() => {
    if (Extension.isAuthorized()) {
      loadSender();
    }
  }, []);

  useEffect(() => {
    if (destinationIsInvalid || !destinationAccount || amount <= 0) return;
    (async () => {
      setIsLoadingFee(true);

      try {
        const _amount = isNativeAsset
          ? Number(amount) * currencyUnits
          : Number(amount) * 10 ** asset.decimals;

        const bnAmount = ethers.BigNumber.from(
          _amount.toLocaleString("fullwide", { useGrouping: false })
        );

        const isXcm = getValues("isXcm");
        const to = getValues("to");

        if (isXcm) {
          const { method, abi, contractAddress, extrinsicValues } = XCM_MAPPING[
            selectedChain.name
          ][to.name]({
            address: destinationAccount,
            amount: bnAmount,
            assetSymbol: asset.symbol,
            xcmPalletVersion: "",
          }) as MapResponseEVM;

          const contract = new ethers.Contract(
            contractAddress,
            abi as string,
            wallet as Wallet
          );

          const feeData = await _api.getFeeData();
          const gasLimit = await contract.estimateGas[method](
            ...Object.keys(extrinsicValues).map(
              (key) =>
                extrinsicValues[
                key as
                | "currency_address"
                | "amount"
                | "destination"
                | "weight"
                ]
            )
          ).catch(() => {
            return BigNumber.from("21000");
          });

          const _gasLimit = gasLimit;
          const _maxFeePerGas = feeData.maxFeePerGas as ethers.BigNumber;
          const _maxPriorityFeePerGas =
            feeData.maxPriorityFeePerGas as ethers.BigNumber;

          const avg = _maxFeePerGas.add(_maxPriorityFeePerGas).div(2);
          let estimatedTotal = avg.mul(_gasLimit);

          if (isNativeAsset) {
            estimatedTotal = estimatedTotal.add(bnAmount);
          }

          setFee({
            "gas limit": _gasLimit,
            "max fee per gas": feeData.maxFeePerGas as BigNumber,
            "max priority fee per gas":
              feeData.maxPriorityFeePerGas as BigNumber,
            "estimated fee": avg,
            "estimated total": estimatedTotal,
          });

          setEvmTx(contract);
        } else if (isNativeAsset) {
          let tx: evmTx = {
            to: destinationAccount,
            value: bnAmount,
          };

          const [feeData, gasLimit] = await Promise.all([
            _api.getFeeData(),
            _api.estimateGas(tx),
          ]);

          const _gasLimit = gasLimit;
          const _maxFeePerGas = feeData.maxFeePerGas as BigNumber;
          const _maxPriorityFeePerGas =
            feeData.maxPriorityFeePerGas as BigNumber;
          tx = {
            ...tx,
            gasLimit: _gasLimit,
            maxFeePerGas: _maxFeePerGas,
            maxPriorityFeePerGas: _maxPriorityFeePerGas,
            type: 2,
            value: bnAmount,
          };

          const avg = _maxFeePerGas
            .add(_maxPriorityFeePerGas)
            .div(BigNumber.from(BigNumber.from(2)));
          const estimatedTotal = avg.mul(_gasLimit).add(bnAmount);

          setFee({
            "gas limit": _gasLimit,
            "max fee per gas": _maxFeePerGas,
            "max priority fee per gas": _maxPriorityFeePerGas,
            "estimated fee": avg,
            "estimated total": estimatedTotal,
          });

          setEvmTx(tx);
        } else {
          const contract = new ethers.Contract(
            asset?.address,
            erc20abi,
            wallet as Wallet
          );

          const feeData = await _api.getFeeData();
          const gasLimit = await contract.estimateGas.transfer(
            destinationAccount,
            bnAmount
          );

          const _gasLimit = gasLimit;
          const _maxFeePerGas = feeData.maxFeePerGas as ethers.BigNumber;
          const _maxPriorityFeePerGas =
            feeData.maxPriorityFeePerGas as ethers.BigNumber;

          const avg = _maxFeePerGas
            .add(_maxPriorityFeePerGas)
            .div(BigNumber.from(2));
          const estimatedTotal = avg.mul(_gasLimit);

          setFee({
            "gas limit": _gasLimit,
            "max fee per gas": feeData.maxFeePerGas as BigNumber,
            "max priority fee per gas":
              feeData.maxPriorityFeePerGas as BigNumber,
            "estimated fee": avg,
            "estimated total": estimatedTotal,
          });

          setEvmTx(contract);
        }
      } catch (error) {
        captureError(error);
        showErrorToast(tCommon("failed_to_get_fees"));
      } finally {
        setIsLoadingFee(false);
      }
    })();
  }, [destinationAccount, destinationIsInvalid, amount, asset?.id]);

  const canContinue = Number(amount) > 0 && destinationAccount && !isLoadingFee;

  const onSubmit = handleSubmit(async () => {
    confirmTx({
      type: AccountType.EVM,
      tx: evmTx as evmTx,
      fee,
      sender: wallet as ethers.Wallet,
    });
  });

  const isEnoughToPay = useMemo(() => {
    if (!amount || !currencyUnits) return false;

    try {
      const _amount = isNativeAsset
        ? Number(amount) * currencyUnits
        : Number(amount) * 10 ** asset.decimals;

      const bnAmount = BigNumber.from(
        _amount.toLocaleString("fullwide", { useGrouping: false })
      );
      const estimatedTotal = fee["estimated total"];
      const nativeBalance = assets[0].balance;

      if (isNativeAsset) {
        return bnAmount.gt(BigNumber0) && estimatedTotal.lte(nativeBalance);
      } else {
        const BNBalance = BigNumber.from(asset?.balance);

        return (
          bnAmount.lte(BNBalance) &&
          estimatedTotal.gt(BigNumber0) &&
          estimatedTotal.lte(nativeBalance)
        );
      }
    } catch (error) {
      captureError(error);
      return false;
    }
  }, [fee, asset, amount, isNativeAsset]);

  return (
    <>
      <ReEnterPassword cb={loadSender} />
      <CommonFormFields />
      <ShowBalance />

      {isLoadingFee ? <Loading /> : <Fees fee={fee} />}

      {canContinue && !isEnoughToPay && (
        <p className="text-sm mt-2 text-red-500 text-center">
          {t("insufficient_balance")}
        </p>
      )}

      <Button
        classname={`font-medium text-base bg-[#212529] hover:bg-${color}-fill transition-all w-full py-2 md:py-4 rounded-md mt-7 mx-0`}
        isDisabled={!canContinue || !isEnoughToPay}
        onClick={onSubmit}
        style={{
          boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
        }}
      >
        {t("continue")}
      </Button>
    </>
  );
};
