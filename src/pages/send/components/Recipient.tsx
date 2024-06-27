import { FC } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SendTxForm } from "../Send";
import { AddressBookOptions } from "./AddressBookOptions";

interface RecipientProps {
  containerClassname?: string;
}

export const Recipient: FC<RecipientProps> = ({ containerClassname = "" }) => {
  const { t } = useTranslation("send");

  const {
    register,
    formState: { errors },
  } = useFormContext<SendTxForm>();

  return (
    <div className={containerClassname}>
      <div className="flex flex-col gap-1 mb-1">
        <label htmlFor="recipient">{t("recipient_address")}</label>
        <input
          id="recipient"
          autoComplete="false"
          {...register("recipientAddress")}
          className="border border-[#636669] bg-transparent text-white px-2 py-4  rounded-lg"
        />
      </div>
      <AddressBookOptions />
      {errors.recipientAddress?.message && (
        <p className="bg-red-900 text-red-300 border-red-400 text-xs rounded px-2 py-1 font-bold">
          {t(errors.recipientAddress.message || "")}
        </p>
      )}
    </div>
  );
};
