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
  const { t } = useTranslation("send");

  const {
    state: { selectedChain },
  } = useNetworkContext();

  const transaction = {
    sender: cropAccount(tx.addressFrom, 12),
    to: cropAccount(tx.addressTo, 12),
    network: (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-1 h-full">
          <img src={selectedChain!.logo} width={12} />
          <RxChevronRight size={12} />
          <img src={selectedChain!.logo} width={12} />
        </div>
      </div>
    ),
    amount: `${tx.amountFrom} ${tx.assetFrom.symbol}`,
    estimated_fee: `${formatFees(
      tx.fee.estimatedFee,
      selectedChain?.decimals || 1
    )} ${tx.assetFrom.symbol}`,
  };

  return (
    <>
      <div className="flex gap-3 items-center mb-7">
        <FiChevronLeft size={26} className="cursor-pointer" onClick={onBack} />
        <p className="text-lg">{t("send_title")}</p>
      </div>
      <TxSummary tx={transaction} />
      <Button
        classname={`font-medium text-base capitalize w-full py-2 mt-7 !mx-0`}
        onClick={onConfirm}
      >
        {t("proceed")}
      </Button>
    </>
  );
};
