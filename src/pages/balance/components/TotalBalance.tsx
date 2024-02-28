import { type FC, useEffect, useState } from "react";
import {
  BsFillEyeSlashFill,
  BsEyeFill,
} from "react-icons/bs";
import { formatAmountWithDecimals, getCurrencyInfo } from "@src/utils/assets";
import {
  useAccountContext,
  useAssetContext,
  useNetworkContext,
} from "@src/providers";

interface TotalBalanceProps {
  balance?: number;
  accountName?: string;
}

export const TotalBalance: FC<TotalBalanceProps> = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [currencyLogo, setCurrencyLogo] = useState("$");

  const {
    state: { selectedAccount },
  } = useAccountContext();

  const {
    state: { assets },
    loadAssets,
  } = useAssetContext();
  const {
    state: { api, selectedChain },
  } = useNetworkContext();

  const updateAllAssets = async () => {
    loadAssets({ api, selectedAccount, selectedChain });
  };

  const totalBalance = assets.reduce(
    (total, item) => total + (item.amount || 0),
    0
  );

  const toggleBalance = () => setShowBalance(!showBalance);

  useEffect(() => {
    setCurrencyLogo(getCurrencyInfo().logo);
    updateAllAssets();
  }, [selectedAccount]);

  return (
    <div className="mx-auto">
      <div className="flex mb-4 gap-2 items-center justify-center">
        <div className="flex gap-2 items-center">
          <p className="text-2xl">{currencyLogo}</p>
          <p className="text-5xl" data-testid="balance">
            {showBalance
              ? formatAmountWithDecimals(totalBalance, 5) || "0"
              : "***"}
          </p>
        </div>
        {!showBalance ? (
          <BsEyeFill
            data-testid="show-balance"
            size={23}
            onClick={toggleBalance}
          />
        ) : (
          <BsFillEyeSlashFill
            data-testid="hide-balance"
            size={23}
            onClick={toggleBalance}
          />
        )}
      </div>
    </div>
  );
};
