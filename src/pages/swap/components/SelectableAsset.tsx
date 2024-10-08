import { Combobox } from "@headlessui/react";
import { useState } from "react";
import { BsCoin } from "react-icons/bs";
import { SwapAsset } from "../base";
import { Loading } from "@src/components/common";
import { GoChevronDown } from "react-icons/go";

export interface SelectableAssetProps<T extends SwapAsset> {
  buttonClassName?: string;
  containerClassName?: string;
  defaulValue: T;
  isLoading?: boolean;
  isReadOnly?: boolean;
  label?: string;
  onChange: (asset: T) => void;
  options: T[];
  value?: T;
  position: 'left' | 'right';
  type: "sell"| "buy"
}

const OptImage = ({ image, id }: { image: string , id: string}) => {
  if (image) {
    return (
      <img
        data-testid={id}
        src={image}
        width={30}
        height={30}
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

export const SelectableAsset = <T extends SwapAsset>({
  buttonClassName,
  containerClassName,
  defaulValue,
  isLoading = false,
  isReadOnly = false,
  label,
  onChange,
  options,
  position,
  value,
}: SelectableAssetProps<T>) => {

  const [query, setQuery] = useState("");

  const filteredAsset =
    query === ""
      ? options
      : options.filter((asset) =>
        (asset?.label || "")
          ?.toLowerCase()
          .replace(/\s+/g, "")
          .includes(query.toLowerCase().replace(/\s+/g, ""))
      );

  return (
    <div className={`flex flex-col flex-1 relative ${containerClassName || ""}`}>
      {label && (
        <p className="mb-2 font-medium font-inter text-xs absolute top-[-25px]">{label}</p>
      )}
      <Combobox value={value} onChange={onChange} defaultValue={defaulValue} data-testid="combobox">
        {({ open }) => (
          <div className="relative h-full">
            <Combobox.Label className="absolute top-1/2 -translate-y-1/2 ml-3">
              {value?.image && <OptImage image={value?.image} id={`default-${value?.id}-${value?.network}`}/>}
            </Combobox.Label>

            {isLoading && (
              <div className="absolute top-1/2 -translate-y-1/2 left-5" data-testid="loading">
                <Loading containerClass="py-0" iconClass="w-5 h-5" />
              </div>
            )}

            <Combobox.Input
              className={`!pl-[3rem] min-w-[120px] h-full w-full text-sm flex justify-between ${open ? "border-[#E6007A]" : ""} border-[1.78px] hover:border-[#E6007A] items-center bg-[#040404] rounded-lg py-3 px-2 cursor-default outline outline-transparent focus:outline-primary-default hover:outline-primary-default ${buttonClassName}`}
              displayValue={(asset: SwapAsset) =>
                `${asset?.symbol?.toUpperCase()}` || ""
              }
              onChange={(e) => setQuery(e.target.value)}
              aria-disabled={isLoading}
              autoComplete="off"
              aria-readonly={isLoading}
              readOnly={isLoading}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2" data-testid="button">
              <GoChevronDown
                className="h-5 w-5 text-white"
                aria-hidden="true"
              />
            </Combobox.Button>
            {!isReadOnly && options?.length > 0 && open && (
              <Combobox.Options
                className={`absolute mt-1 top-10 ${position === "left" ? "left-o" : "right-0"} max-h-60 w-[22rem] sm:w-[20rem] overflow-auto overflow-x-hidden rounded-md bg-[#212529] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50`}
              >
                {filteredAsset?.map((opt, index) => (
                  <Combobox.Option
                    key={index.toString()}
                    value={opt}
                    className="px-2 hover:bg-gray-400 hover:bg-opacity-50 cursor-pointer rounded-xl py-2"
                    data-testid={`${opt.id}`}
                  >
                    <div
                      className="flex gap-2 items-center "
                      data-testid={opt.id}
                    >
                      {opt.image && <OptImage image={opt.image} id={`${value?.id}-${value?.network}`}/>}
                      <div className="flex flex-col">
                        <div className="flex items-start flex-col !w-[200%] sm:w-full">
                          <div className="flex space-x-2 w-[80%]">
                          <span>
                            {`${opt.symbol}`}
                          </span>
                          <span className="text-xs">
                            {`(${opt.name})`}
                          </span>
                          </div>
                          
                          <span className="rounded-xl py-1 px-2 text-[10px] bg-gray-500/20">
                              {opt.network}
                          </span>
                        </div>
                        {/* <span className="py-1 text-gray-400">{opt.name}</span> */}
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
