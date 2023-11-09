import { Combobox } from "@headlessui/react";
import { useThemeContext } from "@src/providers";
import { useState } from "react";
import { BsCoin } from "react-icons/bs";
import { BsChevronExpand } from "react-icons/bs"
import { SwapAsset } from "../base";
import { Loading } from "@src/components/common";

interface SelectableAssetProps<T extends SwapAsset> {
  buttonClassName?: string;
  containerClassName?: string;
  defaulValue: T;
  isLoading?: boolean
  isReadOnly?: boolean;
  label?: string;
  onChange: (asset: T) => void;
  options: T[];
  value: T
}

const OptImage = ({ image }: { image: string }) => {

  if (image) {
    return (
      <img
        src={image}
        width={29}
        height={29}
        className="object-contain rounded-full"
      />
    )
  }

  return (
    <BsCoin
      size={27}
      className="text-[#212529] rounded-full bg-[#f8f9fa] p-[2px]"
    />
  )
}

export const SelectableAsset = <T extends SwapAsset,>({
  buttonClassName,
  containerClassName,
  defaulValue,
  isLoading = false,
  isReadOnly = false,
  label,
  onChange,
  options,
  value,
}: SelectableAssetProps<T>) => {
  const { color } = useThemeContext()


  const [query, setQuery] = useState('')

  const filteredAsset =
    query === ''
      ? options
      : options.filter((asset) =>
        (asset?.label || "")
          ?.toLowerCase()
          .replace(/\s+/g, '')
          .includes(query.toLowerCase().replace(/\s+/g, ''))
      )

  return (
    <div className={`flex flex-col flex-1 ${containerClassName}`}>
      {label && <p className="mb-[2px] font-inter font-bold md:text-lg">{label}</p>}
      <Combobox
        value={value}
        onChange={onChange}
        defaultValue={defaulValue}
      >
        <div className="relative h-full">
          <Combobox.Label className="absolute top-1/2 -translate-y-1/2 ml-1">
            {
              value.image && <OptImage image={value.image} />
            }
          </Combobox.Label>


          {isLoading && (
            <div className="absolute top-1/2 -translate-y-1/2 left-5">
              <Loading containerClass="py-0" />
            </div>
          )}

          <Combobox.Input
            className={`!pl-10 min-w-[120px] h-full w-full flex justify-between items-center bg-[#212529] rounded-2xl py-2 px-2 md:px-6 cursor-default outline outline-transparent focus:outline-${color}-primary hover:outline-${color}-primary ${buttonClassName}`}
            displayValue={(asset: SwapAsset) => asset?.label?.toUpperCase() || ""}
            onChange={(e) => setQuery(e.target.value)}
            aria-disabled={isLoading}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <BsChevronExpand
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Combobox.Button>
          {!isReadOnly && options?.length > 0 && (
            <Combobox.Options
              className="absolute mt-1 top-10 max-h-60 w-full overflow-auto rounded-md bg-[#212529] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
            >
              {filteredAsset?.map((opt, index) => (
                <Combobox.Option
                  key={index.toString()}
                  value={opt}
                  className="px-2 hover:bg-gray-400 hover:bg-opacity-50 cursor-pointer rounded-xl py-2"
                >
                  <div className="flex gap-2">
                    {
                      opt.image && <OptImage image={opt.image} />
                    }
                    <div className="flex flex-col">
                      <div className="flex gap-2 items-center">
                        <span className="md:text-xl">{opt.label?.toUpperCase()}</span>
                        <span className="rounded-xl py-1 px-2 text-xs bg-gray-500/20">{opt.network}</span>
                      </div>
                      <span className="py-1 text-gray-400">{opt.name}</span>
                    </div>
                  </div>
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </div>
  )
}
