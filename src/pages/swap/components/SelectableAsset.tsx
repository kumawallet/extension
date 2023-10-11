import { Listbox } from "@headlessui/react";
import { useThemeContext } from "@src/providers";
import { BsCoin } from "react-icons/bs";
import { MdKeyboardArrowDown } from "react-icons/md"

interface SelectableAssetProps<T extends { image?: string; label?: string | JSX.Element }> {
  label?: string;
  onChange: (asset: T) => void;
  defaulValue: T;
  value: T
  isReadOnly?: boolean;
  options: T[];
  containerClassName?: string;
  buttonClassName?: string;
}

const OptImage = ({ image }: { image: string }) => {
  return (
    // <img
    //   src={image}
    //   width={29}
    //   height={29}
    //   className="object-contain rounded-full"
    // />
    <BsCoin
      size={27}
      className="text-[#212529] rounded-full bg-[#f8f9fa] p-[2px]"
    />
  )
}

export const SelectableAsset = <T extends { image?: string; label?: string | JSX.Element },>({
  label,
  onChange,
  defaulValue,
  value,
  isReadOnly = false,
  options,
  containerClassName,
  buttonClassName
}: SelectableAssetProps<T>) => {
  const { color } = useThemeContext()

  return (
    <div className={`flex flex-col flex-1 ${containerClassName}`}>
      {label && <p className="mb-[2px] font-inter font-bold md:text-lg">{label}</p>}
      <Listbox
        value={value}
        onChange={onChange}
        defaultValue={defaulValue}
      >
        <div className="relative h-full">
          <Listbox.Button
            className={`min-w-[120px] h-full w-full flex justify-between items-center bg-[#212529] rounded-2xl py-2 px-2 md:px-6 cursor-default outline outline-transparent focus:outline-${color}-primary hover:outline-${color}-primary ${buttonClassName}`}
            aria-readonly={isReadOnly}
          >
            <div className="flex gap-2 items-center">
              {
                value.image && <OptImage image={value.image} />
              }
              <span className="whitespace-nowrap overflow-hidden text-ellipsis md:text-xl">
                {value.label}
              </span>
            </div>

            <MdKeyboardArrowDown size={20} />

          </Listbox.Button>
          {!isReadOnly && options?.length > 0 && (
            <Listbox.Options className="absolute mt-1 top-10 max-h-60 w-full overflow-auto rounded-md bg-[#212529] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
              {options?.map((opt, index) => (
                <Listbox.Option
                  key={index.toString()}
                  value={opt}
                  className="px-2 hover:bg-gray-400 hover:bg-opacity-50 cursor-pointer rounded-md flex items-center gap-2 py-2"
                >
                  {
                    opt.image && <OptImage image={opt.image} />
                  }

                  <span className="md:text-xl">{opt.label}</span>
                </Listbox.Option>
              ))}
            </Listbox.Options>
          )}
        </div>
      </Listbox>
    </div>
  )
}
