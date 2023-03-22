import { InputErrorMessage } from "@src/components/common";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TbChevronRight } from "react-icons/tb";
import { NumericFormat } from "react-number-format";
import { Destination } from "./Destination";
import { SelectableAsset } from "./SelectableAsset";
import { SelectableChain } from "./SelectableChain";

export const CommonFormFields = () => {
  const { t } = useTranslation("send");

  const {
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext();

  return (
    <>
      <div className="mx-auto">
        <div className="flex gap-2 justify-center items-end mb-4">
          <div className="px-2">
            <p className="mb-2">From:</p>
            <SelectableChain selectedChain={getValues("from")} />
          </div>
          <TbChevronRight size={26} className="mb-2" />
          <div className="px-2">
            <p className="mb-2">To:</p>
            <SelectableChain
              canSelectChain={true}
              selectedChain={getValues("to")}
              optionChains={[]}
            />
          </div>
        </div>
        <div className="flex flex-col gap-4 mb-3">
          <div>
            <p>{t("destination_account")}</p>
            <Destination />
            <InputErrorMessage
              message={errors.destinationAccount?.message as string}
            />
          </div>
          <div>
            <p>{t("amount")}</p>
            <div className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white">
              <NumericFormat
                className="bg-transparent w-8/12 outline-0"
                allowNegative={false}
                allowLeadingZeros={false}
                value={getValues("amount")}
                onValueChange={({ value }) => {
                  setValue("amount", value);
                }}
                allowedDecimalSeparators={["%"]}
              />

              <div className="w-4/12">
                <SelectableAsset
                  onChangeAsset={(asset) => {
                    setValue("asset", asset);
                  }}
                />
              </div>
            </div>
            <InputErrorMessage message={errors.amount?.message as string} />
          </div>
        </div>
      </div>
    </>
  );
};
