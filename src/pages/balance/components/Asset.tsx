import { FC } from "react";
import { AssetIcon } from "@src/components/common";
import { Asset as IAsset } from "@src/providers/assetProvider/types";
import { SEND } from "@src/routes/paths";
import { formatAmountWithDecimals, formatUSDAmount } from "@src/utils/assets";
import { BsArrowUpRight } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useThemeContext } from "@src/providers";

interface AssetProps {
  asset: IAsset;
}

export const Asset: FC<AssetProps> = ({ asset }) => {
  const navigate = useNavigate();

  const { color } = useThemeContext()

  return (
    <div className="bg-[#343A40] flex px-2 py-2 rounded-2xl  font-inter w-full outline-none justify-between">
      <div className="flex gap-2 items-center">
        <AssetIcon asset={asset} width={32} />
        <div className="flex flex-col">
          <div className="flex gap-1 items-center">
            <p className="font-bold text-xl">
              {formatAmountWithDecimals(
                Number(asset.balance),
                6,
                asset.decimals
              )}
            </p>
            <p className="tx-sm">{asset.symbol}</p>
          </div>
          <div className="text-xs text-gray-400 text-start">
            {formatUSDAmount(asset.amount || 0)}
          </div>
        </div>
      </div>

      <div
        className={`bg-none outline-none py-2 px-3 flex justify-center items-center hover:bg-${color}-fill rounded-full`}
      >
        <BsArrowUpRight size={23} onClick={() => navigate(SEND, {
          state: {
            symbol: asset.symbol,
          }
        })} />
      </div>
    </div>
  );
};
