import { type FC, useEffect, useState } from "react";
import { BsEye } from "react-icons/bs";
import {  PiEyeClosed } from "react-icons/pi";
import { formatAmountWithDecimals, getCurrencyInfo } from "@src/utils/assets";
import {
  useAccountContext,
  useAssetContext,
} from "@src/providers";
import { as } from "@aptos-labs/ts-sdk/dist/common/accountAddress-csDQ8Gnp";
import { number } from "yup";

interface TotalBalanceProps {
  balance?: number;
  accountName?: string;
  // showBalance : boolean;
  // toggleBalance: () => void;
}

export const TotalBalance: FC<TotalBalanceProps> = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [currencyLogo, setCurrencyLogo] = useState("$");

  const {
    state: { selectedAccount },
  } = useAccountContext();

  const {
    state: { assets },

  } = useAssetContext();

useEffect(
  ()=>{
    
  }, [JSON.stringify(assets)]
)
const totalBalance = () => {
 return Object.keys(assets).reduce((acc,address) => {
    const account = assets[address];
     return acc + Object.keys(account).reduce((_acc, network: any) => {
      const _network = account[network].assets
        return _acc +  _network.reduce((__acc: number, asset: any) => {
        return __acc + (Number(asset.amount) | 0)
      },0)
    },0)
  },0)
}
  const toggleBalance = () => setShowBalance(!showBalance);

  useEffect(() => {
    setCurrencyLogo(getCurrencyInfo().logo);
  }, [selectedAccount]);

  return (
    <div className="mx-auto ">
      <div className="flex justify-center w-full">
      {!showBalance ? (
          <PiEyeClosed 
            data-testid="show-balance"
            size={12}
            onClick={toggleBalance}
          />
        ) : (
          <BsEye
            data-testid="hide-balance"
            size={12}
            onClick={toggleBalance}
          />
        )}
      </div>
      
      <div className="flex mb-4 gap-2 items-center justify-center">
        <div className="flex gap-2 items-center">
          <p className="text-2xl">{currencyLogo}</p>
          <p className="text-5xl" data-testid="balance">
            {showBalance
              ? totalBalance()|| "0"
              : "***"}
          </p>
        </div>
        
      </div>
    </div>
  );
};
