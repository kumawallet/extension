import { Combobox } from "@headlessui/react";
import { useState } from "react";
import { GoChevronDown } from "react-icons/go";
import { BsCoin } from "react-icons/bs";
import { chain } from "../../../providers/buyProvider/types.d";

interface SelectableAssetBuyProps<T extends chain> {
  buttonClassName?: string;
  containerClassName?: string;
  defaulValue: T;
  label?: string;
  onChange: (asset: T) => void;
  options: T[];
  value: T;
}
const OptImage = ({ image }: { image: string }) => {
  if (image) {
    return (
      <img
        src={image}
        width={19}
        height={19}
        className="object-contain rounded-full"
      />
    );
  }

  return (
    <BsCoin
      size={27}
      className="text-[#212529] rounded-full bg-[#f8f9fa] p-[2px]"
    />
  );
};
export const SelectableAssetBuy = <T extends chain>({
  buttonClassName,
  containerClassName,
  defaulValue,
  label,
  onChange,
  options,
  value,
}: SelectableAssetBuyProps<T>) => {
  const [query, setQuery] = useState("");

  const filteredAsset =
    query === ""
      ? options
      : options.filter((asset: chain) =>
          (asset?.network || "")
            ?.toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  return (
    <div
      className={`flex flex-col flex-1 relative ${containerClassName || ""}`}
    >
      {label && (
        <p className="mb-2 font-medium font-inter text-xs absolute top-[-25px]">
          {label}
        </p>
      )}
      <Combobox value={value} onChange={onChange} defaultValue={defaulValue}>
        {({ open }) => (
          <div className="relative h-full">
            <Combobox.Label className="absolute top-6 -translate-y-1/2 ml-3">
              {value.logo && <OptImage image={value.logo} />}
            </Combobox.Label>
            <Combobox.Input
              className={`!pl-10 min-w-[120px] h-[3rem] w-full text-sm flex justify-between ${
                open ? "border-[#E6007A]" : ""
              } border-[1.78px] hover:border-[#E6007A] items-center bg-[#040404] rounded-lg py-3 px-2 cursor-default outline outline-transparent focus:outline-primary-default hover:outline-primary-default ${buttonClassName}`}
              displayValue={(asset: chain) =>
                asset?.symbol?.toUpperCase() || ""
              }
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              aria-readonly={true}
              readOnly={true}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2 h-[3rem]">
              <GoChevronDown
                className="h-5 w-5 text-white"
                aria-hidden="true"
              />
            </Combobox.Button>
            {options?.length > 0 && open && (
              <Combobox.Options
                className={`absolute mt-1 top-10 max-h-60  w-full overflow-auto rounded-md bg-[#212529] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50`}
              >
                {filteredAsset?.map((opt, index) => (
                  <Combobox.Option
                    key={index.toString()}
                    value={opt}
                    className="px-2 hover:bg-gray-400 hover:bg-opacity-50 cursor-pointer rounded-xl py-2"
                  >
                    <div className="flex gap-2">
                      {opt.logo && <OptImage image={opt.logo} />}
                      <div className="flex flex-col">
                        <div className="flex gap-2 items-center">
                          <span>{opt.symbol}</span>
                          <span className="rounded-xl py-1 px-2 text-xs text-gray-500">
                            {`( ${opt["network-name"]} )`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            )}
          </div>
        )}
      </Combobox>
    </div>
  );
};
