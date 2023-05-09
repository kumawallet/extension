import { InputErrorMessage } from "@src/components/common";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TbChevronRight } from "react-icons/tb";
import { NumericFormat } from "react-number-format";
import { Destination } from "./Destination";
import { SelectableAsset } from "./SelectableAsset";
import { SelectableChain } from "./SelectableChain";
import { useNetworkContext } from "@src/providers";
import { useEffect, useState } from "react";
import Extension from "@src/Extension";

export const CommonFormFields = () => {
  const { t } = useTranslation("send");

  const {
    state: { selectedChain },
  } = useNetworkContext();

  const {
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useFormContext();

  const to = watch("to");

  const [destinationChains, setDestinationChains] = useState<any[]>([]);

  const getDestinationChains = async () => {
    let chains = [selectedChain];

    if (selectedChain.xcm) {
      const xcmChains = await Extension.getXCMChains(selectedChain.name);
      chains = [...chains, ...xcmChains];
    }

    setDestinationChains(chains);
  };

  useEffect(() => {
    if (selectedChain.name) {
      getDestinationChains();
    }
  }, [selectedChain]);

  useEffect(() => {
    setValue("isXcm", to.name !== selectedChain.name);
  }, [to]);

  return (
    <>
      <div className="mx-auto">
        <div className="flex gap-2 justify-center items-end mb-4">
          <div className="px-2">
            <p className="mb-2 font-inter font-light">From:</p>
            <SelectableChain selectedChain={getValues("from")} />
          </div>
          <TbChevronRight size={26} className="mb-2" />
          <div className="px-2">
            <p className="mb-2 font-inter font-light">To:</p>
            <SelectableChain
              canSelectChain={true}
              selectedChain={getValues("to")}
              optionChains={destinationChains}
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
            <div className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex w-full p-2.5 bg-[#343A40] border-gray-600 placeholder-gray-400 text-white">
              <NumericFormat
                className="bg-transparent w-7/12 outline-0 text-xl font-inter font-bold outline-none"
                allowNegative={false}
                allowLeadingZeros={false}
                value={getValues("amount")}
                onValueChange={({ value }) => {
                  setValue("amount", value);
                }}
                allowedDecimalSeparators={["%"]}
              />

              <div className="w-5/12">
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
