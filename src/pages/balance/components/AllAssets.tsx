import { FC } from "react";
import { AssetIcon } from "@src/components/common";
import { Asset, Asset as IAsset } from "@src/providers/assetProvider/types";
import { SEND } from "@src/routes/paths";
import { formatAmountWithDecimals, formatUSDAmount } from "@src/utils/assets";
import { useNavigate } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa6";

interface AssetProps {
  assets: any;
  symbol?: string ;
}

export const AllAsset: FC<AssetProps> = ({ assets, symbol}) => {
  const navigate = useNavigate();
  return (
     <div className="bg-[#343A40] flex px-2 py-2 rounded-2xl  font-inter w-full outline-none justify-between">
     <div className="flex gap-2 items-center">
     <AssetIcon asset={assets[0]} width={32} />
       <div className="flex flex-col">
         <div className="flex gap-1 items-center">
           <p className="font-bold text-xl">
             {
                 assets.reduce((acc, _asset : any) =>{ 
                    return acc +  formatAmountWithDecimals(
                     Number(_asset.balance),
                     6,
                     _asset.decimals
                   )}, 0) 
             }
           </p>
            <p className="tx-sm">{symbol}</p> 
         </div>
         <div className="text-xs text-gray-400 text-start">
           { formatUSDAmount(assets.reduce((acc, _asset) => acc + JSON.parse(_asset.amount), 0))}
         </div>
       </div>
     </div>

     <div
       className={`bg-none outline-none py-2 px-3 flex justify-center items-center hover:bg-primary-default rounded-full`}
     >
       <FaChevronRight size={21}  />
     </div>
   </div>)

   
};
