import { AccountType } from "@src/accounts/types";
import { Loading, LoadingButton } from "@src/components/common";
import Extension from "@src/Extension";
import { useToast } from "@src/hooks";
import { useAssetContext, useNetworkContext } from "@src/providers";
import { formatBN } from "@src/utils/assets";
import { ethers, Wallet } from "ethers";
import { FC, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { confirmTx, evmTx } from "../Send";
import { CommonFormFields } from "./CommonFormFields";
import erc20abi from "@src/constants/erc20.abi.json";

const BN0 = ethers.BigNumber.from(0);

interface EvmFormProps {
  confirmTx: confirmTx;
}

export const EvmForm: FC<EvmFormProps> = ({ confirmTx }) => {
  const { t } = useTranslation("send");

  const {
    state: { api, selectedChain },
  } = useNetworkContext();

  const {
    handleSubmit,
    watch,
    formState: { errors },
  } = useFormContext();

  const {
    state: { assets },
  } = useAssetContext();

  const { showErrorToast } = useToast();

  const [fee, setFee] = useState({
    "gas limit": BN0,
    "max fee per gas": BN0,
    "max base fee per gas": BN0,
    "max priority fee per gas": BN0,
    "estimated fee": BN0,
    "estimated total": BN0,
  });
  const [isLoadingFee, setIsLoadingFee] = useState(false);
  const [wallet, setWallet] = useState<ethers.Wallet | null>(null);
  const [evmTx, setEvmTx] = useState<evmTx | ethers.Contract | null>(null);

  const _api = api as ethers.providers.JsonRpcProvider;
  const decimals = selectedChain?.nativeCurrency.decimals || 1;
  const currencyUnits = 10 ** decimals;
  const amount = watch("amount");
  const asset = watch("asset");
  const isNativeAsset = asset?.id === "-1";
  const destinationAccount = watch("destinationAccount");
  const destinationIsInvalid = Boolean(errors?.destinationAccount?.message);
  const nativeSymbol = selectedChain?.nativeCurrency.symbol;

  useEffect(() => {
    (async () => {
      const pk = await Extension.showPrivateKey();

      const wallet = new ethers.Wallet(
        pk as string,
        api as ethers.providers.JsonRpcProvider
      );

      setWallet(wallet);
    })();
  }, []);

  useEffect(() => {
    if (destinationIsInvalid || !destinationAccount || amount <= 0) return;
    (async () => {
      setIsLoadingFee(true);

      try {
        const _amount = isNativeAsset
          ? amount * currencyUnits
          : amount * 10 ** asset.decimals;

        const bnAmount = ethers.BigNumber.from(
          _amount.toLocaleString("fullwide", { useGrouping: false })
        );
        if (isNativeAsset) {
          let tx: evmTx = {
            to: destinationAccount,
            value: bnAmount,
          };

          const [feeData, gasLimit] = await Promise.all([
            _api.getFeeData(),
            _api.estimateGas(tx),
          ]);

          const _gasLimit = gasLimit;
          const _maxFeePerGas = feeData.maxFeePerGas as ethers.BigNumber;
          const _maxPriorityFeePerGas =
            feeData.maxPriorityFeePerGas as ethers.BigNumber;
          tx = {
            ...tx,
            gasLimit: _gasLimit,
            maxFeePerGas: _maxFeePerGas,
            maxPriorityFeePerGas: _maxPriorityFeePerGas,
            type: 2,
            value: bnAmount,
          };

          const avg = _maxFeePerGas.add(_maxPriorityFeePerGas).div(2);
          const estimatedTotal = avg.mul(_gasLimit);

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

          const avg = _maxFeePerGas.add(_maxPriorityFeePerGas).div(2);
          const estimatedTotal = avg.mul(_gasLimit);

          setFee({
            "gas limit": _gasLimit,
            "max fee per gas": feeData.maxFeePerGas as any,
            "max priority fee per gas": feeData.maxPriorityFeePerGas as any,
            "estimated fee": avg,
            "estimated total": estimatedTotal,
          });

          setEvmTx(contract);
          // const tx = await contract.transfer(destinationAccount, bnAmount, {
          //   gasLimit: _gasLimit,
          // });
        }
      } catch (error) {
        showErrorToast(error);
      } finally {
        setIsLoadingFee(false);
      }
    })();
  }, [destinationAccount, destinationIsInvalid, amount, asset?.id]);

  const canContinue = Number(amount) > 0 && destinationAccount && !isLoadingFee;

  const onSubmit = handleSubmit(async () => {
    confirmTx({
      type: AccountType.EVM,
      tx: {
        ...evmTx,
      },
      fee,
      sender: wallet as ethers.Wallet,
    });
  });

  return (
    <>
      <CommonFormFields />

      {isLoadingFee ? (
        <Loading />
      ) : (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <p>{t("gas_limit")}</p>
            <p className="font-bold">{String(fee["gas limit"])} gwei</p>
          </div>
          <div className="flex justify-between">
            <p>{t("estimated_fee")}</p>
            <p className="font-bold">{`${formatBN(
              fee["estimated fee"].toString(),
              asset?.decimals
            )} ${nativeSymbol}`}</p>
          </div>
          <div className="flex justify-between">
            <p>{t("estimated_total")}</p>
            {isNativeAsset ? (
              <>
                <p className="font-bold">
                  {`${formatBN(
                    fee["estimated total"].toString(),
                    decimals
                  )} ${nativeSymbol}`}
                </p>
              </>
            ) : (
              <>
                <p className="font-bold">{`${amount} ${
                  asset?.symbol
                } + ${formatBN(
                  fee["estimated total"].toString(),
                  decimals
                )} ${nativeSymbol}`}</p>
              </>
            )}
          </div>
        </div>
      )}

      <LoadingButton
        classname="font-medium text-base bg-custom-green-bg w-full py-2 md:py-4 rounded-md mt-7"
        isDisabled={!canContinue}
        onClick={onSubmit}
      >
        {t("continue")}
      </LoadingButton>
    </>
  );
};
