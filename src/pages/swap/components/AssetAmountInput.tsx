import { Loading } from "@src/components/common";
import { useThemeContext } from "@src/providers";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { NumericFormat } from "react-number-format";

interface AssetAmountInputProps {
  amount: string;
  balance: string;
  containerClassName?: string;
  hasMaxOption?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  label: string;
  minSellAmount?: string | null;
  onMax?: () => void;
  onValueChange: (amount: string) => void;
  selectableAsset: JSX.Element;
  showBalance?: boolean
}

export const AssetAmountInput: FC<AssetAmountInputProps> = ({
  amount,
  balance,
  containerClassName,
  hasMaxOption = false,
  isDisabled = false,
  isLoading = false,
  label,
  minSellAmount,
  onMax,
  onValueChange,
  selectableAsset,
  showBalance = true
}) => {
  const { t } = useTranslation("swap");

  const { color } = useThemeContext();

  return (
    <div className={containerClassName}>
      <div className="flex justify-between">
        <p className="font-inter font-bold text-lg">{label}</p>
        {
          showBalance && (
            <p className="font-inter font-bold text-lg text-[#9CA3AF]">
              {t("balance")}: {balance}
            </p>
          )
        }
      </div>

      <div className="flex">
        <div className="flex-1 relative h-fit w-[60%]">
          <NumericFormat
            className={`input-secondary py-3 rounded-2xl pr-12 outline outline-transparent focus:outline-${color}-primary hover:outline-${color}-primary rounded-r-none`}
            allowNegative={false}
            allowLeadingZeros={false}
            value={isLoading ? "" : amount}
            onValueChange={({ value }) => {
              onValueChange(value || "0");
            }}
            disabled={isLoading || isDisabled}
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

          {isLoading && (
            <div className="absolute top-1/2 -translate-y-1/2 left-5">
              <Loading containerClass="py-0" />
            </div>
          )}
        </div>

        {selectableAsset}
      </div>
      {minSellAmount && (
        <p>
          {t("min_amount")}: {minSellAmount}
        </p>
      )}
    </div>
  );
};
