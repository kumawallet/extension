import { FC, useState } from "react";
import { Listbox } from "@headlessui/react";
import { Chain } from "@src/storage/entities/Chains";
import { useFormContext } from "react-hook-form";

interface SelectableChainProps {
  canSelectChain?: boolean;
  selectedChain: Chain;
  optionChains?: Chain[];
}

export const SelectableChain: FC<SelectableChainProps> = ({
  canSelectChain = false,
  selectedChain,
  optionChains,
}) => {
  const [chain, setChain] = useState(selectedChain);

  const { setValue } = useFormContext();

  if (!selectedChain?.name) return null;

  return (
    <Listbox
      value={chain}
      onChange={(val) => {
        setChain(val);
        setValue("to", val);
      }}
      defaultValue={selectedChain}
    >
      <div className="relative mt-1 grid">
        <Listbox.Button
          className="min-w-[120px] flex justify-center bg-[#212529] rounded-xl py-3 px-2 md:px-6 items-center gap-2 cursor-default"
          read-only={Boolean(canSelectChain).toString()}
          style={{
            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
          }}
        >
          <img
            src={`/images/${chain.logo}.png`}
            width={29}
            height={29}
            className="object-contain rounded-full"
          />
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">
            {chain.name}
          </span>
        </Listbox.Button>
        {canSelectChain && (optionChains?.length || 0) > 0 && (
          <Listbox.Options className="absolute mt-1 max-h-60 w-max overflow-auto rounded-md bg-[#212529] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
            {optionChains?.map((chain) => (
              <Listbox.Option
                key={chain.name}
                value={chain}
                className="px-2 hover:bg-gray-400 hover:bg-opacity-50 cursor-pointer rounded-md flex items-center gap-2 py-2"
              >
                <img
                  src={`/images/${chain.logo}.png`}
                  width={29}
                  height={29}
                  className="object-contain rounded-full"
                />
                <span>{chain.name}</span>
              </Listbox.Option>
            ))}
          </Listbox.Options>
        )}
      </div>
    </Listbox>
  );
};
