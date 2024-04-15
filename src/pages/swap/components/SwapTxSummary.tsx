import { FC } from "react";
import { Tx } from "../hooks";
import { Button, TxSummary } from "@src/components/common";
import { cropAccount } from "@src/utils/account-utils";
import { formatFees } from "@src/utils/assets";
import { useNetworkContext } from "@src/providers";
import { RxChevronRight } from "react-icons/rx";
import { FiChevronLeft } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface SwapTxSummaryProps {
  tx: Tx;
  onBack: () => void;
  onConfirm: () => void;
}

export const SwapTxSummary: FC<SwapTxSummaryProps> = ({
  tx,
  onBack,
  onConfirm,
}) => {
  const { t } = useTranslation("swap");
  const { t: tSend } = useTranslation("send")

  const {
    state: { selectedChain },
  } = useNetworkContext();

  const transaction = {
    [tSend('sender')]: cropAccount(tx.addressFrom, 12),
    [tSend('to')]: cropAccount(tx.addressBridge, 12),
    [tSend('network')]: (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-1 h-full">
          <img src={selectedChain!.logo} width={12} className="rounded-full" />
          <RxChevronRight size={12} />
          <img src={selectedChain!.logo} width={12} className="rounded-full" />
        </div>
      </div>
    ),
    [tSend('amount')]: `${tx.amountFrom} ${tx.assetFrom.symbol}`,
    [tSend('estimated_fee')]: `${formatFees(
      tx.fee.estimatedFee,
      selectedChain?.decimals || 1
    )} ${tx.assetFrom.symbol}`,
    [t('tx_confirm_info')]: t("tx_confirm_info_message", {
      address_to_transfer: tx.addressBridge,
      address_to_receive: tx.addressTo,
      receive_amount: tx.amountTo,
      receive_asset: tx.assetTo.symbol
    })
  };

  return (
    <>
      <div className="flex gap-3 items-center mb-7">
        <FiChevronLeft size={26} className="cursor-pointer" onClick={onBack} />
        <p className="text-lg">{t("send_title")}</p>
      </div>
      <div className="flex flex-1">
        <TxSummary tx={transaction} />
      </div>
      <Button
        classname={`font-medium text-base capitalize w-full py-2 mt-7 !mx-0`}
        onClick={onConfirm}
      >
        {t("proceed")}
      </Button>
    </>
  );
};
