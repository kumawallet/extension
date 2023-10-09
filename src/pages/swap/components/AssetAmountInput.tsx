import { useThemeContext } from "@src/providers";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { NumericFormat } from "react-number-format";

interface AssetAmountInputProps {
  label: string;
  balance: string;
  amount: string;
  onValueChange: (amount: string) => void;
  hasMaxOption?: boolean;
  onMax?: () => void;
  selectableAsset: JSX.Element;
  containerClassName?: string;
}

export const AssetAmountInput: FC<AssetAmountInputProps> = ({
  label,
  balance,
  amount,
  onValueChange,
  hasMaxOption = false,
  onMax,
  selectableAsset,
  containerClassName
}) => {
  const { t } = useTranslation("swap");

  const { color } = useThemeContext();

  return (
    <div className={containerClassName}>
      <div className="flex justify-between">
        <p className="font-inter font-bold text-lg">{label}</p>
        <p className="font-inter font-bold text-lg text-[#9CA3AF]">
          {t("balance")}: {balance}
        </p>
      </div>

      <div className="flex">
        <div className="flex-1 relative h-fit w-[60%]">
          <NumericFormat
            className={`input-secondary py-3 rounded-2xl pr-12 outline outline-transparent focus:outline-${color}-primary hover:outline-${color}-primary rounded-r-none`}
            allowNegative={false}
            allowLeadingZeros={false}
            value={amount}
            onValueChange={({ value }) => {
              onValueChange(value || "0");
            }}
            allowedDecimalSeparators={["%"]}
          />

          {hasMaxOption && (
            <button
              className="absolute right-3 -translate-y-1/2 top-1/2 text-bold text-[#D1D5DB] hover:bg-gray-400 hover:bg-opacity-40 p-1 rounded-2xl"
              onClick={onMax}
            >
              {t("max")}
            </button>
          )}
        </div>
        {selectableAsset}
      </div>
    </div>
  );
};
