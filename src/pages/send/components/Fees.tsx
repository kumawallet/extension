import { FC } from "react";
import { useNetworkContext } from "@src/providers";
import { useTranslation } from "react-i18next";

interface FeesProps {
  estimatedFee: string;
  estimatedTotal: string;
  gasLimit?: string;
}

export const Fees: FC<FeesProps> = ({
  estimatedFee,
  estimatedTotal,
  gasLimit,
}) => {
  const { t } = useTranslation("send");
  const {
    state: { type },
  } = useNetworkContext();

  if (!type) return null;

  return (
    <div className="flex flex-col gap-1 w-full">
      {type === "EVM" && (
        <div className="flex justify-between gap-2">
          <p>{t("gas_limit")}</p>
          <p className="font-bold font-inter">{String(gasLimit)} gwei</p>
        </div>
      )}

      <div className="flex justify-between gap-2">
        <p>{t("estimated_fee")}:</p>
        <p>{estimatedFee}</p>
      </div>

      <div className="flex justify-between gap-2">
        <p>{t("estimated_total")}:</p>
        <p className="font-bold font-inter">{estimatedTotal}</p>
        {/* {isNativeAsset ? (
          <>
            <p className="font-bold font-inter">
              {`${formatBN(
                String(fee["estimated total"]),
                decimals
              )} ${nativeSymbol}`}
            </p>
          </>
        ) : (
          <>
            <p className="font-bold font-inter">{`${amount} ${asset?.symbol} + ${formatBN(
              String(fee["estimated total"]),
              decimals
            )} ${nativeSymbol}`}</p>
          </>
        )} */}
      </div>
    </div>
  );
};
