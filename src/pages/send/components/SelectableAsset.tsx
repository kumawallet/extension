import { FC, useEffect, useState } from "react";
import { Listbox } from "@headlessui/react";
import { useAssetContext } from "@src/providers";
import { FiChevronDown } from "react-icons/fi";
import { Asset } from "@src/providers/assetProvider/types";
import { useNetworkContext } from "../../../providers/networkProvider/NetworkProvider";

interface SelectableAssetProps {
  onChangeAsset: (asset: Asset) => void;
}

export const SelectableAsset: FC<SelectableAssetProps> = ({
  onChangeAsset,
}) => {
  const {
    state: { selectedChain },
  } = useNetworkContext();

  const {
    state: { assets },
  } = useAssetContext();

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetsToSelect, setAssetsToSelect] = useState<Asset[]>([]);

  const _onChangeAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    onChangeAsset?.(asset);
  };

  useEffect(() => {
    if (assets.length > 0) {
      setAssetsToSelect(
        assets.filter(({ id, balance }) => (id === "-1" ? true : balance > 0))
      );
      setSelectedAsset(assets[0]);
      onChangeAsset(assets[0]);
    }
  }, [assets]);

  return (
    <Listbox value={selectedAsset} onChange={_onChangeAsset}>
      <div className="relative mt-1">
        <Listbox.Button className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex items-center gap-1 w-full p-2.5 bg-[#343A40] border-gray-600 placeholder-gray-400 text-white">
          {selectedAsset?.id === "-1" ? (
            <img
              src={`/images/${selectedChain.logo}.png`}
              width={32}
              height={24}
              className="object-cover rounded-full"
            />
          ) : (
            <div className="w-8 h-6 flex justify-center">
              <div className="w-6 h-6 bg-gray-400 bg-opacity-40 rounded-full" />
            </div>
          )}
          <span className="block truncate font-inter">
            {selectedAsset?.symbol || ""}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <FiChevronDown
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#212529] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-40">
          {assetsToSelect.map((asset, index) => (
            <Listbox.Option
              key={index.toString()}
              value={asset}
              disabled={false}
              className="px-2 hover:bg-gray-400 hover:bg-opacity-50 cursor-pointer rounded-md flex items-center gap-2 py-2"
            >
              {asset.id === "-1" ? (
                <img
                  src={`/images/${selectedChain.logo}.png`}
                  width={32}
                  height={24}
                  className="object-cover rounded-full"
                />
              ) : (
                <div className="w-8 h-6 flex justify-center">
                  <div className="w-6 h-6 bg-gray-400 bg-opacity-40 rounded-full" />
                </div>
              )}
              <span className="font-inter">{asset.symbol}</span>
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
};
