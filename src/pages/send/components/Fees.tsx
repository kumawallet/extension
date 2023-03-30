import React from "react";
import { useNetworkContext } from "@src/providers";
import { useTranslation } from "react-i18next";
import { formatBN } from "@src/utils/assets";
import { useFormContext } from "react-hook-form";

export const Fees = ({ fee }: any) => {
  const { t } = useTranslation("send");
  const {
    state: { type, selectedChain },
  } = useNetworkContext();
  const { watch } = useFormContext();

  const decimals = selectedChain?.nativeCurrency.decimals || 1;
  const amount = watch("amount");
  const asset = watch("asset");
  const isNativeAsset = asset?.id === "-1";
  const nativeSymbol = selectedChain?.nativeCurrency.symbol;

  if (!type) return null;

  return (
    <div className="flex flex-col gap-1 w-full">
      {type === "EVM" && (
        <div className="flex justify-between gap-2">
          <p>{t("gas_limit")}</p>
          <p className="font-bold">{String(fee["gas limit"])} gwei</p>
        </div>
      )}

      <div className="flex justify-between gap-2">
        <p>{t("estimated_fee")}</p>
        <p>{formatBN(fee["estimated fee"].toString(), decimals)}</p>
      </div>

      <div className="flex justify-between gap-2">
        <p>{t("estimated_total")}</p>
        {isNativeAsset ? (
          <>
            <p className="font-bold">
              {`${formatBN(
                fee["estimated total"].toString(),
                decimals
              )} ${nativeSymbol}`}
            </p>
          </>
        ) : (
          <>
            <p className="font-bold">{`${amount} ${asset?.symbol} + ${formatBN(
              fee["estimated total"].toString(),
              decimals
            )} ${nativeSymbol}`}</p>
          </>
        )}
      </div>
    </div>
  );
};
