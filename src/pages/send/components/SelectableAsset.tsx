import { FC, useState } from "react";
import { Listbox } from "@headlessui/react";

interface SelectableAssetProps {
  onChangeAsset: (asset: any) => void;
  assetList?: any[];
}

const MOCK_ASSETS = [
  {
    id: 1,
    name: "DOT",
  },
  {
    id: 2,
    name: "ASTR",
  },
];

export const SelectableAsset: FC<SelectableAssetProps> = ({
  assetList = MOCK_ASSETS,
  onChangeAsset,
}) => {
  const [asset, setAsset] = useState(assetList[0]);

  const _onChangeAsset = (asset: any) => {
    console.log(asset);
    setAsset(asset);
    onChangeAsset?.(asset);
  };

  return (
    <Listbox value={asset} onChange={_onChangeAsset}>
      <div className="relative mt-1">
        <Listbox.Button className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white">
          {asset.name}
        </Listbox.Button>
        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#212529] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {assetList.map((asset, index) => (
            <Listbox.Option
              key={index.toString()}
              value={asset}
              className="px-2 hover:bg-gray-400 hover:bg-opacity-50 cursor-pointer rounded-md"
            >
              {asset.name}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
};
