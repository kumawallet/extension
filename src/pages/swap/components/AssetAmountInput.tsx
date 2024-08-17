import { FC, useEffect } from "react";
import { Loading } from "@src/components/common";
import { useTranslation } from "react-i18next";
import { NumericFormat } from "react-number-format";

interface AssetAmountInputProps {
  amount: string;
  balance: string;
  containerClassName?: string;
  hasMaxOption?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  isReadOnly?: boolean;
  label: string;
  minSellAmount?: string | null;
  onMax?: () => void;
  onValueChange: (amount: string) => void;
  selectableAsset: JSX.Element;
  showBalance?: boolean
  isPairValid?: boolean
  type: "buy"| "sell"
}

export const AssetAmountInput: FC<AssetAmountInputProps> = ({
  amount,
  balance,
  containerClassName,
  hasMaxOption = false,
  isDisabled = false,
  isLoading = false,
  isReadOnly = false,
  label,
  minSellAmount,
  onMax,
  onValueChange,
  selectableAsset,
  showBalance = true,
  isPairValid,
  type
}) => {
  const { t } = useTranslation("swap");

  return (
    <div className={containerClassName}>
      <div className="flex justify-between mb-2">
        <p className="font-inter font-medium md:text-lg">{label}</p>
        {
          showBalance && (
            <p className="font-inter font-medium md:text-lg text-[#9CA3AF] capitalize">
              {t("balance")}: {balance}
            </p>
          )
        }
      </div>

      <div className="flex">
        {selectableAsset}
        <div className="flex-1 relative h-fit w-[60%]">
          <NumericFormat
            className={`input-secondary py-3 rounded-lg pr-12 outline bg-[#343a40] border border-[#727e8b17] text-[#9CA3AF] font-bold outline-transparent focus:outline-primary-default hover:outline-primary-default rounded-l-none`}
            allowNegative={false}
            allowLeadingZeros={false}
            value={isLoading ? "" : amount}
            onValueChange={({ value }) => {
              onValueChange(value || "0");
            }}
            disabled={isLoading || isDisabled || isReadOnly || type==="buy"}
            allowedDecimalSeparators={["%"]}
            readOnly={isReadOnly}
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
              <Loading containerClass="py-0" iconClass="w-5 h-5s" />
            </div>
          )}
        </div>

        
      </div>
      {minSellAmount && isPairValid && (
        <p>
          {t("min_amount")}: {minSellAmount}
        </p>
      )}
    </div>
  );
};
