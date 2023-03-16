import { AccountType } from "@src/accounts/types";
import { Loading, LoadingButton } from "@src/components/common";
import Extension from "@src/Extension";
import { useToast } from "@src/hooks";
import { useNetworkContext } from "@src/providers";
import { ethers } from "ethers";
import { FC, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { confirmTx, evmTx } from "../Send";
import { CommonFormFields } from "./CommonFormFields";

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

  const { showErrorToast } = useToast();

  const [fee, setFee] = useState({
    gasLimit: 0,
    lastBaseFeePerGas: 0,
    maxPriorityFeePerGas: 0,
  });
  const [isLoadingFee, setIsLoadingFee] = useState(false);
  const [wallet, setWallet] = useState<ethers.Wallet | null>(null);
  const [evmTx, setEvmTx] = useState<evmTx | null>(null);

  const _api = api as ethers.providers.JsonRpcProvider;
  const decimals = selectedChain?.nativeCurrency.decimals || 1;
  const amount = watch("amount");
  const destinationAccount = watch("destinationAccount");
  const destinationIsInvalid = Boolean(errors?.destinationAccount?.message);

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
    if (!evmTx?.to) return;
    (async () => {
      setIsLoadingFee(true);
      try {
        const [feeData, gasLimit] = await Promise.all([
          _api.getFeeData(),
          _api.estimateGas(evmTx),
        ]);

        setFee({
          gasLimit: Number(gasLimit),
          lastBaseFeePerGas: Number(feeData.lastBaseFeePerGas),
          maxPriorityFeePerGas: Number(feeData.maxPriorityFeePerGas),
        });

        setEvmTx((prevState) => ({
          ...prevState,
          gasLimit,
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        }));
      } catch (error) {
        showErrorToast(error);
      } finally {
        setIsLoadingFee(false);
      }
    })();
  }, [evmTx?.to]);

  useEffect(() => {
    if (destinationIsInvalid) {
      setEvmTx({});
      return;
    }

    setEvmTx((prevState) => ({
      ...prevState,
      value: amount,
      to: destinationAccount || "",
    }));
  }, [amount, destinationAccount, destinationIsInvalid]);

  const canContinue = Number(amount) > 0 && destinationAccount && !isLoadingFee;

  const onSubmit = handleSubmit(async () => {
    confirmTx({
      type: AccountType.EVM,
      tx: {
        ...evmTx,
        value: amount,
      },
      // aditional,
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
          {Object.keys(fee).map((key) => (
            <div key={key} className="flex justify-between">
              <p>{key}</p>
              <p className="font-bold">{fee[key]}</p>
            </div>
          ))}
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
