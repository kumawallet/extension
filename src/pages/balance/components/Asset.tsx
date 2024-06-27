import { FC } from "react";
import { AssetIcon } from "@src/components/common";
import { BALANCE_ACCOUNTS, SEND } from "@src/routes/paths";
import { formatUSDAmount } from "@src/utils/assets";
import { useNavigate } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa6";
import { Asset as IAsset } from "@src/types";

interface AssetProps {
  asset: IAsset;
}

export const Asset: FC<AssetProps> = ({ asset }) => {
  const navigate = useNavigate();

  const hasMultiplesAccounts = Object.keys(asset.accounts || {})?.length > 0;

  return (
    <div className="bg-[#343A40] flex px-2 py-2 rounded-2xl  font-inter w-full outline-none justify-between">
      <div
        data-testid="asset"
        className="flex gap-2 items-center"
        onClick={() => {
          if (hasMultiplesAccounts) {
            navigate(BALANCE_ACCOUNTS, { state: { asset } });
          }
        }}
      >

        <AssetIcon asset={asset} width={32} />
        <div className="flex flex-col">
          <div className="flex gap-1 items-center">
            <p className="font-bold text-xl">{asset.balance}</p>
            <p className="tx-sm">{asset.symbol}</p>
          </div>
          <div className="text-xs text-gray-400 text-start">
            {formatUSDAmount(Number(asset.amount) || 0)}
          </div>
        </div>
      </div>

      <div

        className={`bg-none outline-none py-2 px-3 flex justify-center items-center hover:bg-primary-default rounded-full`}
      >
        <FaChevronRight
          data-testid="send"
          size={21}
          onClick={() =>
            navigate(SEND, {
              state: {
                symbol: asset.symbol,
              },
            })
          }
        />
      </div>
    </div>
  );
};
