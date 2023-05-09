import { FC } from "react";
import { LoadingButton } from "@src/components/common";
import { cropAccount } from "@src/utils/account-utils";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAccountContext } from "@src/providers";
import { FiChevronLeft } from "react-icons/fi";
import { useCopyToClipboard } from "@src/hooks/common/useCopyToClipboard";
import { Fees } from "./Fees";
import { AssetIcon } from "@src/components/common/AssetIcon";
import { Tx } from "@src/types";

interface ConfirmTxProps {
  tx: Tx;
  onConfirm: () => void;
  isLoading: boolean;
}

export const ConfirmTx: FC<ConfirmTxProps> = ({ onConfirm, isLoading, tx }) => {
  const {
    state: { selectedAccount },
  } = useAccountContext();
  const { t } = useTranslation("send");
  const navigate = useNavigate();

  const { getValues, watch } = useFormContext();

  const amount = getValues("amount");

  const destinationAccount = getValues("destinationAccount");
  const originAccount = getValues("from");

  const { Icon: IconFrom, copyToClipboard: copyToClipboardFrom } =
    useCopyToClipboard(selectedAccount.value.address || "");
  const { Icon: IconTo, copyToClipboard: copyToClipboardTo } =
    useCopyToClipboard(destinationAccount);

  const originChainName = originAccount.name;

  const asset = watch("asset");

  const destinationChain = getValues("to");

  return (
    <div className="mx-auto px-2">
      <div className="flex gap-3 items-center mb-7">
        <FiChevronLeft
          size={26}
          className="cursor-pointer"
          onClick={() => navigate(-1)}
        />

        <p className="text-xl">{t("transfer")}</p>
      </div>
      <div className="mb-5">
        {<p className="mb-2">{t("chains")}:</p>}{" "}
        <div
          className="flex justify-around items-center bg-[#212529] rounded-xl py-3 px-5 gap-1"
          style={{
            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div
            data-testid="origin-chain"
            className="flex flex-col items-center gap-2"
          >
            <div className="flex gap-2 items-center">
              <img
                src={`/images/${originAccount.logo}.png`}
                width={29}
                height={29}
                className="object-cover rounded-full"
              />
              <p>{originChainName}</p>
            </div>
            <button
              className="flex items-center gap-2"
              onClick={copyToClipboardFrom}
            >
              <p className="text-[#FFC300]">
                {cropAccount(selectedAccount.value.address || "")}
              </p>
              <IconFrom
                messagePosition="right"
                iconProps={{
                  color: "#FFC300",
                }}
              />
            </button>
          </div>
          <div className="flex gap-1">
            <FaChevronLeft />
            <FaChevronRight />
          </div>
          <div
            data-testid="destination-chain"
            className="flex flex-col items-center gap-2"
          >
            <div className="flex gap-2 items-center">
              <img
                src={`/images/${destinationChain.logo}.png`}
                width={29}
                height={29}
                className="object-cover rounded-full"
              />
              <p>{destinationChain.name}</p>
            </div>
            <button
              className="flex items-center gap-2"
              onClick={copyToClipboardTo}
            >
              <p className="text-[#FFC300]">
                {cropAccount(destinationAccount)}
              </p>
              <IconTo
                messagePosition="right"
                iconProps={{
                  color: "#FFC300",
                }}
              />
            </button>
          </div>
        </div>
      </div>
      <div className="mb-5">
        <p>{t("assets")}:</p>
        <div className="flex justify-around items-center bg-[#343A40] rounded-xl py-3 px-5">
          <div
            data-testid="origin-asset"
            className="flex flex-col items-center"
          >
            <div className="flex gap-2 items-center">
              <AssetIcon asset={asset} width={30} />

              <p className="font-inter uppercase">{asset?.name}</p>
            </div>
            <p className="font-inter">
              <span className=" font-bold text-[27px] mr-2">{amount}</span>
              <span className="uppercase">{asset?.symbol}</span>
            </p>
          </div>
          <div className="flex gap-1">
            <FaChevronLeft />
            <FaChevronRight />
          </div>
          <div
            data-testid="destination-asset"
            className="flex flex-col items-center"
          >
            <div className="flex gap-2 items-center">
              <AssetIcon asset={asset} width={30} />

              <p className="font-inter uppercase">{asset?.name}</p>
            </div>
            <p className="font-inter">
              <span className="font-bold text-[27px] mr-2">{amount}</span>
              <span className="uppercase">{asset?.symbol}</span>
            </p>
          </div>
        </div>
      </div>
      <div className="mb-5">
        <p>{t("details")}:</p>
        <div className="flex bg-[#343A40] rounded-xl py-3 px-5 w-full">
          <Fees fee={tx?.fee || {}} />
        </div>
      </div>
      <LoadingButton
        classname="font-medium text-base bg-custom-green-bg w-full py-2 md:py-4 rounded-md"
        onClick={onConfirm}
        isLoading={isLoading}
        isDisabled={isLoading}
      >
        {t("confirm")}
      </LoadingButton>
    </div>
  );
};
