import { FC, useEffect, useState } from "react";
import { Listbox } from "@headlessui/react";
import { useToast } from "@src/hooks";
import { useNetworkContext } from "@src/providers";
import { FiChevronDown } from "react-icons/fi";

interface SelectableAssetProps {
  onChangeAsset: (asset: any) => void;
  assetList?: any[];
}

export const SelectableAsset: FC<SelectableAssetProps> = ({
  assetList = [],
  onChangeAsset,
}) => {
  const {
    state: { selectedChain },
  } = useNetworkContext();

  const { showErrorToast } = useToast();
  const [asset, setAsset] = useState<any>(null);
  const [assetsToSelect, setAssetsToSelect] = useState(assetList);

  const _onChangeAsset = (asset: any) => {
    console.log(asset);
    setAsset(asset);
    onChangeAsset?.(asset);
  };

  useEffect(() => {
    (async () => {
      try {
        if (selectedChain?.name) {
          setAssetsToSelect([selectedChain.nativeCurrency]);
          setAsset(selectedChain.nativeCurrency);
        }
      } catch (error) {
        showErrorToast(error);
      }
    })();
  }, [selectedChain?.name]);

  return (
    <Listbox value={asset} onChange={_onChangeAsset}>
      <div className="relative mt-1">
        <Listbox.Button className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white">
          <span className="block truncate">{asset?.symbol || ""}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <FiChevronDown
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#212529] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {assetsToSelect.map((asset, index) => (
            <Listbox.Option
              key={index.toString()}
              value={asset}
              className="px-2 hover:bg-gray-400 hover:bg-opacity-50 cursor-pointer rounded-md"
            >
              {asset.symbol}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
};
