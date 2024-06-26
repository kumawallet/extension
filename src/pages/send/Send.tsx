import { useCallback, useEffect, useState } from "react";
import { Button, PageWrapper } from "@src/components/common";
import { useTranslation } from "react-i18next";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { useAccountContext, useNetworkContext } from "@src/providers";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string } from "yup";
import { useLoading, useToast } from "@src/hooks";
import { BALANCE } from "@src/routes/paths";
import { FiChevronLeft } from "react-icons/fi";
import { Chain, SelectedChain } from "@src/types";
import { captureError } from "@src/utils/error-handling";
import { messageAPI } from "@src/messageAPI/api";
import { Recipient } from "./components/Recipient";
import { AssetToSend } from "./components/AssetToSend";
import { FeeAndTip } from "./components/FeeAndTip";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { useNavigate } from "react-router-dom";
import { SendTxResume } from "./components/SendTxResume";
import { validateRecipientAddress } from "@src/utils/transfer";
import { SelectAccount } from "./components/SelectAccount";
import { ErrorMessage } from "./components";
import Account from "@src/storage/entities/Account";
import { getAccountType } from "@src/utils/account-utils";
import { TransactionRequest } from "ethers";

const schema = object({
  recipientAddress: string().when(
    ["targetNetwork"],
    ([targetNetwork], schema) => {
      return schema.test("recipientAddress", "invalid_address", (value) => {
        if (value?.trim() === "") return true;
        if (!value || !targetNetwork) return false;
        return validateRecipientAddress(value, targetNetwork.type);
      });
    }
  ),
  asset: object({}).required("Required"),
  originNetwork: object({}).required("Required"),
  targetNetwork: object({}).required("Required"),
  amount: string().required("Required"),
  tip: string(),
});

const getDefaultData = ({
  selectedAccount,
  chains,
  selectedChain,
}: {
  selectedAccount: Account | null;
  chains: Chain[];
  selectedChain: SelectedChain;
}): SendTxForm => {
  const senderAddress = selectedAccount?.value?.address || "";

  let originNetwork = null;
  let targetNetwork = null;
  let asset = null;

  if (senderAddress) {
    const accountType = getAccountType(selectedAccount!.type)?.toLowerCase();

    const firstChainId = Object.keys(selectedChain).find((chainId) => {
      return selectedChain[chainId].type === accountType;
    });

    if (firstChainId) {
      const defaultChain = chains.find(
        (chain) => chain.id === firstChainId
      ) as Chain;

      originNetwork = defaultChain || null;
      targetNetwork = defaultChain || null;

      if (!originNetwork || !targetNetwork) {
        asset = {
          id: "-1",
          symbol: originNetwork.symbol,
          decimals: originNetwork.decimals,
          balance: "0",
          address: "",
        };
      }
    }
  }

  return {
    recipientAddress: "",
    senderAddress,
    asset,
    originNetwork: originNetwork,
    targetNetwork: targetNetwork,
    amount: "0",
    tip: "0",
    fee: "0",
    isXcm: false,
    isLoadingFee: false,
    isTipEnabled: false,
    haveSufficientBalance: false,
  };
};

export interface SendTxForm {
  asset: {
    id: string;
    symbol: string;
    decimals: number;
    balance: string;
    address?: string;
  } | null;
  amount: string;
  evmTx?: TransactionRequest;
  extrinsicHash?: SubmittableExtrinsic<"promise"> | unknown;
  fee: string;
  isLoadingFee?: boolean;
  isXcm?: boolean;
  originNetwork: Chain | null;
  recipientAddress: string;
  senderAddress: string;
  targetNetwork: Chain | null;
  tip?: string;
  isTipEnabled: boolean;
  haveSufficientBalance: boolean;
}

export const Send = () => {
  const { t } = useTranslation("send");
  const navigate = useNavigate();
  const { showSuccessToast, showErrorToast } = useToast();
  const { isLoading, starLoading, endLoading } = useLoading()

  const {
    state: { selectedAccount },
  } = useAccountContext();
  const {
    state: { chains, selectedChain },
  } = useNetworkContext();

  const methods = useForm<SendTxForm>({
    defaultValues: getDefaultData({
      selectedAccount,
      chains: chains.map((chain) => chain.chains).flat(),
      selectedChain,
    }),
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const {
    watch,
    handleSubmit,
    setValue,
  } = methods;

  const [isConfirmingTx, setIsConfirmingTx] = useState(false);

  const onBack = useCallback(() => {
    if (isConfirmingTx) return setIsConfirmingTx(false);

    navigate(-1);
  }, [isConfirmingTx]);

  const onSubmit: SubmitHandler<SendTxForm> = useCallback(async () => {
    if (!isConfirmingTx) return setIsConfirmingTx(true);

    starLoading();
    try {
      messageAPI.sendTx();
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
    endLoading();
  }, [isConfirmingTx]);

  const isLoadingFees = watch("isLoadingFee");
  const haveSufficientBalance = watch("haveSufficientBalance");
  const _selectedAccount = watch("senderAddress");

  const originNetwork = watch("originNetwork");
  const targetNetwork = watch("targetNetwork");
  const recipientAddress = watch("recipientAddress");
  const sender = watch("senderAddress");
  const amount = watch("amount");
  const asset = watch("asset");

  useEffect(() => {
    if (
      !originNetwork ||
      !targetNetwork ||
      !recipientAddress ||
      !sender ||
      !asset
    )
      return;

    if (
      !validateRecipientAddress(
        recipientAddress,
        originNetwork.type as "evm" | "wasm"
      )
    ) {
      return;
    }

    if (amount === "0") return;

    (async () => {
      try {
        setValue("isLoadingFee", true);

        await messageAPI.updateTx({
          tx: {
            amount,
            senderAddress: sender,
            destinationAddress: recipientAddress,
            originNetwork,
            targetNetwork,
            asset: asset,
          },
        });
      } catch (error) {
        console.log("update Tx error:", error);
      }
    })();
  }, [originNetwork, targetNetwork, recipientAddress, sender, amount, asset]);

  return (
    <PageWrapper
      contentClassName="h-full flex-1"
      innerContentClassName="flex flex-col"
    >
      <div className="flex gap-3 items-center mb-7">
        <FiChevronLeft size={15} className="cursor-pointer" onClick={onBack} />
        <p className="text-base font-medium">
          {t(isConfirmingTx ? "review_transfer_title" : "send_title")}
        </p>
      </div>

      <FormProvider {...methods}>
        <div className="flex-1">
          {!isConfirmingTx ? (
            <>
              <SelectAccount
                selectedAddress={_selectedAccount}
                onChangeValue={(value) =>
                  methods.setValue("senderAddress", value)
                }
              />
              <Recipient containerClassname="my-4" />
              <AssetToSend />
              <FeeAndTip containerClassname="mt-4" />
              <ErrorMessage containerClassname="mt-2" />
            </>
          ) : (
            <SendTxResume />
          )}
        </div>

        <Button
          data-testid="send-button"
          isLoading={isLoading}
          isDisabled={isLoadingFees || !haveSufficientBalance}
          classname="w-full py-4"
          onClick={handleSubmit(onSubmit)}
        >
          {t("send_title")}
        </Button>
      </FormProvider>
    </PageWrapper>
  );
};
