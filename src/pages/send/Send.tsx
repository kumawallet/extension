import { useCallback, useState } from "react";
import { Button, PageWrapper } from "@src/components/common";
import { useTranslation } from "react-i18next";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import {
  useAccountContext,
  useAssetContext,
  useNetworkContext,
} from "@src/providers";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string } from "yup";
import { useToast } from "@src/hooks";
import { BALANCE } from "@src/routes/paths";
import { FiChevronLeft } from "react-icons/fi";
import { Chain } from "@src/types";
import { captureError } from "@src/utils/error-handling";
import { messageAPI } from "@src/messageAPI/api";
import { Recipient } from "./components/Recipient";
import { AssetToSend } from "./components/AssetToSend";
import { FeeAndTip } from "./components/FeeAndTip";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { useNavigate } from "react-router-dom";
import { providers } from "ethers";
import { ErrorMessage } from "./components/ErrorMessage";
import { SendTxResume } from "./components/SendTxResume";
import { transformAmountStringToBN } from "@src/utils/assets";
import { validateRecipientAddress } from "@src/utils/transfer";

const schema = object({
  recipientAddress: string().when(["targetNetwork"], ([targetNetwork], schema) => {
    return schema.test("recipientAddress", "invalid_address", (value) => {
      if (value?.trim() === "") return true
      if (!value || !targetNetwork) return false;
      return validateRecipientAddress(value, targetNetwork.type);
    })
  }),
  asset: object({}).required("Required"),
  originNetwork: object({}).required("Required"),
  targetNetwork: object({}).required("Required"),
  amount: string().required("Required"),
  tip: string(),
});

export interface SendTxForm {
  asset: {
    id: string;
    symbol: string;
    decimals: number;
    balance: string;
    address?: string;
  };
  amount: string;
  evmTx?: providers.TransactionRequest;
  extrinsicHash?: SubmittableExtrinsic<"promise"> | unknown;
  fee: string;
  isLoadingFee?: boolean;
  isXcm?: boolean;
  originNetwork: Chain;
  recipientAddress: string;
  senderAddress: string;
  targetNetwork: Chain;
  tip?: string;
  isTipEnabled: boolean;
  haveSufficientBalance: boolean;
}

export const Send = () => {
  const { t } = useTranslation("send");
  const navigate = useNavigate();
  const { showSuccessToast, showErrorToast } = useToast();

  const {
    state: { assets },
  } = useAssetContext();

  const {
    state: { selectedChain },
  } = useNetworkContext();

  const {
    state: { selectedAccount },
  } = useAccountContext();

  const methods = useForm<SendTxForm>({
    defaultValues: {
      recipientAddress: "",
      senderAddress: selectedAccount.value.address,
      asset: {
        id: assets[0]?.id,
        symbol: selectedChain?.symbol,
        decimals: selectedChain?.decimals || 1,
        balance: "0",
        address: assets[0]?.address,
      },
      originNetwork: selectedChain as Chain,
      targetNetwork: selectedChain as Chain,
      amount: "0",
      tip: "0",
      fee: "0",
      isXcm: false,
      isLoadingFee: false,
      isTipEnabled: false,
      haveSufficientBalance: false,
    },
    resolver: yupResolver(schema),
    mode: "onBlur"
  });

  const {
    watch,
    handleSubmit,
    formState: { isValid },
  } = methods;

  const [isConfirmingTx, setIsConfirmingTx] = useState(false);

  const onBack = useCallback(() => {
    if (isConfirmingTx) return setIsConfirmingTx(false);

    navigate(-1);
  }, [isConfirmingTx]);

  const onSubmit: SubmitHandler<SendTxForm> = useCallback(
    async (data) => {
      if (!isConfirmingTx) return setIsConfirmingTx(true);

      try {
        const {
          amount,
          asset,
          recipientAddress: destinationAddress,
          senderAddress: originAddress,
          originNetwork,
          targetNetwork,
          extrinsicHash,
          evmTx,
          tip,
        } = data;

        const txType = originNetwork.type;

        if (txType === "wasm") {
          messageAPI.sendSubstrateTx({
            amount: amount,
            asset: {
              id: asset.id,
              symbol: asset.symbol,
            },
            destinationAddress,
            originAddress,
            destinationNetwork: targetNetwork.name,
            networkName: originNetwork.name,
            rpc: originNetwork.rpcs[0] as string,
            isSwap: false,
            hexExtrinsic: extrinsicHash as string,
            tip: tip
              ? transformAmountStringToBN(
                tip,
                originNetwork.decimals
              )?.toString()
              : undefined,
          });
        } else if (txType === "evm") {
          messageAPI.sendEvmTx({
            amount: amount,
            asset: {
              id: asset.id,
              symbol: asset.symbol,
            },
            destinationAddress,
            originAddress,
            destinationNetwork: targetNetwork.name,
            networkName: originNetwork.name,
            rpc: originNetwork.rpcs[0] as string,
            isSwap: false,
            evmTx,
          });
        }

        showSuccessToast(t("tx_send"));
        navigate(BALANCE, {
          state: {
            tab: "activity",
          },
        });
      } catch (error) {
        captureError(error);
        showErrorToast(error);
      }
    },
    [isConfirmingTx]
  );

  const isLoadingFees = watch("isLoadingFee");
  const haveSufficientBalance = watch("haveSufficientBalance");

  return (
    <PageWrapper
      contentClassName="h-full flex-1"
      innerContentClassName="flex flex-col"
    >
      <div className="flex gap-3 items-center mb-7">
        <FiChevronLeft size={26} className="cursor-pointer" onClick={onBack} />
        <p className="text-lg">{t(isConfirmingTx ? "review_transfer_title" : "send_title")}</p>
      </div>

      <FormProvider {...methods}>
        <div className="flex-1">
          {!isConfirmingTx ? (
            <>
              <Recipient containerClassname="mb-4" />
              <AssetToSend />
              <FeeAndTip containerClassname="mt-4" />
              <ErrorMessage containerClassname="mt-2" />
            </>
          ) : (
            <SendTxResume />
          )}
        </div>

        <Button
          isDisabled={isLoadingFees || !isValid || !haveSufficientBalance}
          classname="w-full py-3"
          onClick={handleSubmit(onSubmit)}
        >
          {t("send")}
        </Button>
      </FormProvider>
    </PageWrapper>
  );
};
