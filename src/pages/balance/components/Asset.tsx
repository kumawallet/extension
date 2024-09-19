import { FC, useEffect } from "react";
import { AssetIcon } from "@src/components/common";
import { BALANCE_ACCOUNTS, SEND, ASSET_NETWORK } from "@src/routes/paths";
import { formatUSDAmount } from "@src/utils/assets";
import { useNavigate } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa6";
import { useNetworkContext } from "@src/providers";
import { AssetAccount } from "@src/types";
export interface IAsset {
  address?: string;
  amount: string;
  balance: string;
  decimals: number;
  id: string;
  price?: string;
  symbol: string;
  transferable?: string;
  usdPrice?: number;
  accounts?: {
    [id: string]: AssetAccount;
  };
  accountKey ?: string;
  assetNumber ?: number;
  network ?: string;
}
interface AssetProps {
  asset: IAsset ;
  isDetail?: boolean
}

export const Asset: FC<AssetProps> = ({ asset , isDetail = false}) => {
  const navigate = useNavigate();

  const hasMultiplesAccounts = Object.keys(asset.accounts || {})?.length > 0;
  const { state: { chains }} = useNetworkContext()

  const networkName =(assetId: string) => {
    const allChains = chains.flatMap((chain) => chain.chains);
    return allChains.find((asset) => asset.id === assetId)?.name || assetId
  }
  const router = () => {
    if(asset.assetNumber && asset.assetNumber > 1  && !isDetail) return ASSET_NETWORK
    else return BALANCE_ACCOUNTS
  }


  return (
    <div className="bg-[#343A40] flex px-2 py-2 rounded-2xl  font-inter w-full outline-none justify-between"
    onClick={() => {
      if (hasMultiplesAccounts) {
        navigate( router(), { state: { asset } });
      }
    }}>
      <div
        data-testid="asset"
        className={`flex gap-2 ${isDetail && "justify-between"} items-center`}
        
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
        {asset.network && 
      <div className="flex items-center">
          <p className="tx-xs">{networkName(asset.network)}</p>
      </div>} 
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
