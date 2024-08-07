import { useFormContext } from "react-hook-form";
import { SendTxForm } from "../Send";
import { formatFees } from "@src/utils/assets";
import { useTranslation } from "react-i18next";
import { RxChevronRight } from "react-icons/rx";
import { cropAccount } from "@src/utils/account-utils";
import { TxSummary } from "@src/components/common";

export const SendTxResume = () => {
  const { t } = useTranslation("send");

  const { getValues } = useFormContext<SendTxForm>();

  const transaction = {
    [t('sender')]: cropAccount(getValues("senderAddress"), 12),
    [t('to')]: cropAccount(getValues("recipientAddress"), 12),
    [t('network')]: (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-1 h-full">
          <img src={getValues("originNetwork")?.logo} width={12} />
          <RxChevronRight size={12} />
          <img src={getValues("targetNetwork")?.logo} width={12} />
        </div>
        {getValues("originNetwork")?.id !== getValues("targetNetwork")?.id && (
          <span className="text-xs">{t("transer_using_xcm")}</span>
        )}
      </div>
    ),
    [t('amount')]: `${getValues("amount")} ${getValues("asset.symbol")}`,
    [t('estimated_fee')]: (
      <div className="flex items-center">
        {formatFees(getValues("fee"), getValues("originNetwork.decimals"))}{" "}
        {getValues("originNetwork.symbol")}
      </div>
    ),
    [t('tip_review')]: `${getValues("tip")} ${getValues("originNetwork.symbol")}`,
  };

  return <TxSummary tx={transaction} />;
};
