import { FC, useEffect, useState } from "react";
import { Tx } from "../hooks";
import { Button, TxSummary } from "@src/components/common";
import { cropAccount } from "@src/utils/account-utils";
import { formatFees } from "@src/utils/assets";
import { RxChevronRight } from "react-icons/rx";
import { FiChevronLeft } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { messageAPI } from "@src/messageAPI/api";

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
  const [fee, setFee] = useState("0");
  const [isAlive, setIsAlive] = useState<boolean>(true)

  useEffect(() => {
    messageAPI.getFee((fee) => {
      setFee(fee)
    })

  }, [])

  const getInfo =() =>{
    return !isAlive ? t("info_swap_hydradx") : ""
  }

  const transaction = {
    [tSend('sender')]: cropAccount(tx.addressFrom, 12),
    [tSend('to')]: cropAccount(tx.addressBridge, 12),
    [tSend('network')]: (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-1 h-full">
          <img src={tx.chainFrom.image} width={12} className="rounded-full" />
          <RxChevronRight size={12} />
          <img src={tx.chainFrom.image} width={12} className="rounded-full" />
        </div>
      </div>
    ),
    [tSend('amount')]: `${tx.amountFrom} ${tx.assetFrom.symbol}`,
    [tSend('estimated_fee')]: tx.chainFrom.name === "HydraDX" ? `${formatFees(fee, 12)} HDX` : `${formatFees(fee, tx.assetFrom.decimals)} ${tx.chainFrom.name === "hydradx" ? "HDX" :tx.assetFrom.symbol}`,
    [t('tx_confirm_info')]: tx.chainFrom.name === "HydraDX" ? getInfo() : t("tx_confirm_info_message", {
      address_to_transfer: tx.addressBridge,
      address_to_receive: tx.addressTo,
      receive_amount: tx.amountTo,
      receive_asset: tx.assetTo.symbol
    })
  };


  const Alive =(): boolean => {
    const currentTime = Date.now(); 
      
    if (tx.aliveUntil && currentTime > tx.aliveUntil) {
      setIsAlive(false)
      transaction[t('tx_confirm_info')] = "The quote has expired. Please request a new quote."
      return false
    }
    setIsAlive(true)
    return true;
  }
  useEffect(() => {
    if(tx.aliveUntil){
    const intervalId = setInterval(Alive, 1000); 
    
    return () => clearInterval(intervalId);
    }

    
  }, [tx.aliveUntil]);

  return (
    <>
      <div className="flex gap-3 items-center mb-7" >
        <FiChevronLeft size={26} className="cursor-pointer" onClick={onBack} data-testid="onBack-arrow"/>
        <p className="text-lg" onClick={onBack} data-testid="onBack-text"></p>
      </div>
      <div className="flex flex-1">
        <TxSummary tx={transaction} />
      </div>
      {tx.chainFrom.name === "Hydration" &&
        <div className="w-full text-base text-[#EBE212] text-center">
          {getInfo()}
        </div>
      }
      <Button
        isDisabled={!isAlive}
        classname={`font-medium text-base capitalize w-full py-2 mt-7 !mx-0`}
        onClick={onConfirm}
      >
        {t("proceed")}
      </Button>
    </>
  );
};
