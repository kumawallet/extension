import { FC } from "react";
import { AssetIcon, Button } from "@src/components/common";
import { Asset as IAsset } from "@src/providers/assetProvider/types";
import { formatAmountWithDecimals, formatUSDAmount } from "@src/utils/assets";
import { useNavigate } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa6";
import { BALANCE_ACCOUNTS } from "@src/routes/paths";


interface AssetProps {
  assets: IAsset[];
  symbol?: string;
}

export const AllAsset: FC<AssetProps> = ({ assets, symbol }) => {
  const navigate = useNavigate();
  return (
    <Button classname="bg-[#343A40] flex px-2 py-2 rounded-2xl  font-inter w-full outline-none justify-between " variant="contained-black"
      onClick={() => navigate(BALANCE_ACCOUNTS, { state: { assets } })}>
      <div className="flex gap-2 items-center">
        <AssetIcon asset={assets[0]} width={32} />
        <div className="flex flex-col">
          <div className="flex gap-1 items-center">
            <p className="font-bold text-xl">
              {
                parseFloat(assets.reduce((acc, _asset: any) => {
                  return acc + formatAmountWithDecimals(
                    Number(_asset.balance),
                    6,
                    _asset.decimals
                  )
                }, 0).toFixed(3))
              }
            </p>
            <p className="tx-sm">{symbol}</p>
          </div>
          <div className="text-xs text-gray-400 text-start">
            {formatUSDAmount(assets.reduce((acc, _asset) => acc + Number(_asset.amount) | 0, 0))}
          </div>
        </div>
      </div>

      <div
        className={`py-2 px-3 flex justify-center items-center rounded-full`}
      >
        <FaChevronRight size={21} />
      </div>
    </Button>)


};
