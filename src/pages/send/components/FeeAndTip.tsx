import { FC, FormEvent, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SendTxForm } from "../Send";
import { formatBN } from "@src/utils/assets";
import { messageAPI } from "@src/messageAPI/api";
import { Switch } from "@headlessui/react";
import { NumericFormat } from "react-number-format";

interface FeeAndTipProps {
  containerClassname?: string;
}

export const FeeAndTip: FC<FeeAndTipProps> = ({ containerClassname }) => {
  const { t } = useTranslation("send");


  const { watch, setValue } = useFormContext<SendTxForm>();
  const originNetwork = watch("originNetwork");
  const targetNetwork = watch("targetNetwork");

  const fee = watch("fee");

  useEffect(() => {
    messageAPI.getFee((fee) => {
      setValue("fee", fee)
      setValue('isLoadingFee', false);
    })

  }, [])

  const isLoadingFee = watch("isLoadingFee");
  const isTipEnabled = watch("isTipEnabled");
  const tip = watch("tip");

  return (
    <div
      className={`${containerClassname} flex flex-col gap-2 justify-around py-3 px-4 bg-[#1C1C27] rounded-xl`}
    >
      <div className="w-full flex justify-between items-center">
        <p className="text-[#A3A3A3]">{t("estimated_fee")}</p>
        <p className={`text-[#FEFDFD] ${isLoadingFee ? "animate-pulse" : ""}`}>
          {formatBN(fee, originNetwork.decimals || 1, 6)}{" "}
          {originNetwork.symbol || ""}
        </p>
      </div>
      <div className="w-full flex justify-between items-center">
        <p className="text-[#A3A3A3]">{t("tip")}</p>
        <Switch
          checked={isTipEnabled}
          onChange={(value) => setValue("isTipEnabled", value)}
          className={`${isTipEnabled ? "bg-teal-400" : "bg-gray-400"
            } relative inline-flex ha-[0.6rem] w-[1.9rem] items-center rounded-full`}
        >
          <span className="sr-only">Enable tip</span>
          <span
            className={`${isTipEnabled ? "translate-x-4" : "translate-x-0"
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
      </div>
      {isTipEnabled && (


        <div className="py-1">

          <div className="flex items-center p-2 border border-[#636669] rounded-lg">
            <NumericFormat
              className="bg-transparent text-[#9CA3AF] outline-none border-none px-1 text-base w-[2ch]"
              onValueChange={({ value }) => {
                setValue("tip", value);
              }}
              value={tip}
              thousandSeparator=","
              onInput={(e: FormEvent<HTMLInputElement>) => {
                e.currentTarget.style.width =
                  (e.currentTarget.value.length || 1) + 1 + "ch";
              }}
            />
            <span className="text-[#FEFDFD] text-base">{targetNetwork.symbol}</span>
          </div>
        </div>
      )}
    </div>
  );
};
