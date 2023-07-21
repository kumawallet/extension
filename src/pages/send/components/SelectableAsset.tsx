import { FC, useEffect, useState } from "react";
import { Listbox } from "@headlessui/react";
import { useAssetContext } from "@src/providers";
import { FiChevronDown } from "react-icons/fi";
import { Asset } from "@src/providers/assetProvider/types";
import { AssetIcon } from "@src/components/common/AssetIcon";
import { useFormContext } from "react-hook-form";
import { XCM_ASSETS_MAPPING } from "@src/constants/xcm";

interface SelectableAssetProps {
  onChangeAsset: (asset: Asset) => void;
}

export const SelectableAsset: FC<SelectableAssetProps> = ({
  onChangeAsset,
}) => {
  const {
    state: { assets },
  } = useAssetContext();

  const { watch, getValues } = useFormContext();

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetsToSelect, setAssetsToSelect] = useState<Asset[]>([]);

  const to = watch("to");

  const _onChangeAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    onChangeAsset?.(asset);
  };

  useEffect(() => {
    const from = getValues("from");
    const isXcm = to.name !== from.name;
    if (isXcm) {
      const xcmAssets = XCM_ASSETS_MAPPING[from.name]?.[to.name] || [];

      const filteredAssets = assets.filter(
        ({ symbol }, index, self) =>
          xcmAssets.includes(symbol) &&
          self.findIndex((s) => s.symbol === symbol) === index
      );

      const _assets = filteredAssets.length > 0 ? filteredAssets : assets;
      setSelectedAsset(_assets[0]);
      onChangeAsset(_assets[0]);
      setAssetsToSelect(_assets);
    } else {
      if (assets.length > 0) {
        setSelectedAsset(assets[0]);
        onChangeAsset(assets[0]);
        setAssetsToSelect(assets);
      }
    }
  }, [assets, to]);

  return (
    <Listbox value={selectedAsset} onChange={_onChangeAsset}>
      <div className="relative mt-1" data-testid="select-asset">
        <Listbox.Button
          data-testid="selected-button"
          className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex items-center gap-1 w-full p-2.5 bg-[#343A40] border-gray-600 placeholder-gray-400 text-white"
        >
          <AssetIcon asset={selectedAsset} width={25} />
          <span
            data-testid="selected-asset"
            className="block truncate font-inter"
          >
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
              <AssetIcon asset={asset} width={28} />
              <span className="font-inter">{asset.symbol}</span>
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
};
