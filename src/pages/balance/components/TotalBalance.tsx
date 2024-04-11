import { type FC, useEffect, useState } from "react";
import { BsEye } from "react-icons/bs";
import {  PiEyeClosed } from "react-icons/pi";
import { formatAmountWithDecimals, getCurrencyInfo } from "@src/utils/assets";
import {
  useAccountContext,
  useAssetContext,
  useNetworkContext,
} from "@src/providers";

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




  const totalBalance = assets.reduce(
    (total, item) => total + (item.amount || 0),
    0
  );

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
              ? formatAmountWithDecimals(totalBalance, 5) || "0"
              : "***"}
          </p>
        </div>
        
      </div>
    </div>
  );
};
