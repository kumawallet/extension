import { FC, useState } from "react";
import { Listbox } from "@headlessui/react";

interface SelectableChainProps {
  canSelectChain?: boolean;
  selectedChain: any;
  optionChains?: any[];
}

export const SelectableChain: FC<SelectableChainProps> = ({
  canSelectChain = false,
  selectedChain,
  optionChains = [],
}) => {
  const [chain, setChain] = useState(selectedChain || { name: "default" });

  return (
    <Listbox value={chain} onChange={setChain} defaultValue={selectedChain}>
      <div className="relative mt-1">
        <Listbox.Button
          className="flex justify-center bg-[#212529] rounded-xl py-3 px-5"
          read-only={Boolean(canSelectChain).toString()}
        >
          {chain.name}
        </Listbox.Button>
        {canSelectChain && optionChains?.length > 0 && (
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#212529] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
            {optionChains?.map((chain) => (
              <Listbox.Option key={chain.name} value={optionChains}>
                {chain.name}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        )}
      </div>
    </Listbox>
  );
};
