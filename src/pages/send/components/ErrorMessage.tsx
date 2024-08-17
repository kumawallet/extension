import { FC, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { SendTxForm } from "../Send";
import { BN } from "@polkadot/util";
import { transformAmountStringToBN } from "@src/utils/assets";
import { useTranslation } from "react-i18next";

interface ErrorMessageProps {
  containerClassname?: string;
}

export const ErrorMessage: FC<ErrorMessageProps> = ({
  containerClassname = "",
}) => {
  const { t } = useTranslation("send");
  const { watch, setValue } = useFormContext<SendTxForm>();

  const amount = watch("amount");
  const asset = watch("asset");
  const fee = watch("fee");
  const originNetwork = watch("originNetwork");
  const isTipEnabled = watch("isTipEnabled");
  const tip = watch("tip");

  const haveSufficientBalance = useMemo(() => {
    if (!asset || amount.endsWith(".") ||  amount.trim() === "0") return false;

    const isNativeAsset = originNetwork?.symbol === asset.symbol;
 
    let bnAmount = transformAmountStringToBN(amount, asset.decimals);
 
    if (isNativeAsset) {
 
      const bnFee = new BN(fee);

      if (isTipEnabled) {
        const bnTip = transformAmountStringToBN(tip || "0", asset.decimals);

        bnAmount = bnAmount.add(new BN(bnTip));
      }
    
      const totalBalance = bnAmount.add(bnFee);
    
      const haveSufficientBalance = totalBalance.lte(new BN(asset.balance));
      setValue("haveSufficientBalance", haveSufficientBalance);
      return haveSufficientBalance;
    } else {
      let bnBalance = new BN(asset.balance);
    
      if (isTipEnabled) {
        const bnTip = transformAmountStringToBN(tip || "0", asset.decimals);

        bnBalance = bnBalance.add(new BN(bnTip));
      }
      
      const haveEnoughBalance = bnAmount.gte(new BN(Number(amount)));
      const haveEnoughFee = bnBalance.gte(new BN(fee));
      const haveSufficientBalance = haveEnoughBalance && haveEnoughFee;
      setValue("haveSufficientBalance", haveSufficientBalance);
      return haveEnoughBalance && haveEnoughFee;
    }
  }, [amount, asset, fee, originNetwork, isTipEnabled, tip]);

  if (haveSufficientBalance || amount.trim() === "0") return null;

  return (
    <div className={containerClassname}>
      <div className="bg-red-900 text-red-300 border-red-400 text-xs rounded px-2 py-1 font-bold">
        {t("insufficient_balance")}
      </div>
    </div>
  );
};
