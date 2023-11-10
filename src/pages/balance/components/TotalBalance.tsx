import { FC, useEffect, useMemo, useState } from "react";
import {
  BsArrowUpRight,
  BsArrowDownLeft,
  BsFillEyeSlashFill,
  BsEyeFill,
} from "react-icons/bs";
import { useTranslation } from "react-i18next";
import { formatAmountWithDecimals, getCurrencyInfo } from "@src/utils/assets";
import { useNavigate } from "react-router-dom";
import { SEND, RECEIVE, SWAP } from "@src/routes/paths";
import { useAccountContext, useAssetContext, useNetworkContext } from "@src/providers";
import { Button } from "@src/components/common";
import { RiTokenSwapLine } from "react-icons/ri";
import { SUPPORTED_CHAINS_FOR_SWAP } from "@src/pages/swap/base";

interface TotalBalanceProps {
  balance?: number;
  accountName?: string;
}

export const TotalBalance: FC<TotalBalanceProps> = () => {
  const { t } = useTranslation("balance");
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [showBalance, setShowBalance] = useState(true);
  const [currencyLogo, setCurrencyLogo] = useState("$");

  const {
    state: { selectedAccount },
    updateAccountName,
  } = useAccountContext();

  const {
    state: { assets },
    loadAssets,
  } = useAssetContext();
  const {
    state: { api, selectedChain, type },
  } = useNetworkContext();

  const updateAllAssets = async () => {
    loadAssets({ api, selectedAccount, selectedChain });
  }

  const totalBalance = assets.reduce((total, item) => total + (item.amount || 0), 0);

  const update = async () => {
    setIsEditing(false);
    if (!accountName || accountName.trim() === "") {
      setAccountName(selectedAccount.value.name);
      return;
    }

    updateAccountName(selectedAccount.key, accountName);
  };

  const toggleBalance = () => setShowBalance(!showBalance);


  const isSwapAvailable = useMemo(() => {

    if (!selectedChain?.name || !type) return false;

    return SUPPORTED_CHAINS_FOR_SWAP[type.toLowerCase() as 'wasm' | 'evm'].includes(selectedChain?.name);

  }, [selectedChain, type])

  useEffect(() => {
    if (selectedAccount?.value?.name) {
      setAccountName(selectedAccount.value.name);
    }

    setCurrencyLogo(getCurrencyInfo().logo);
    updateAllAssets();
  }, [selectedAccount]);

  return (
    <div className="mx-auto">
      <div className="flex items-center justify-center mb-4">
        {!isEditing ? (
          <p
            data-testid="account-name"
            className="text-center text-2xl cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            {accountName}
          </p>
        ) : (
          <input
            data-testid="account-name-input"
            className="input-primary"
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            onKeyDown={({ key }) => key === "Enter" && update()}
            onBlur={update}
          />
        )}
      </div>
      <div className="flex mb-4 gap-2 items-center justify-center">
        <div className="flex gap-2 items-center">
          <p className="text-2xl">{currencyLogo}</p>
          <p className="text-5xl" data-testid="balance">
            {showBalance ? (formatAmountWithDecimals(totalBalance, 5) || "0") : "***"}
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
      <div className="flex gap-1 justify-center">
        <Button onClick={() => navigate(SEND)} variant="text" classname="w-1/2  md:w-1/3 px-1 m-0">
          <span className="flex items-center gap-1 text-base md:text-lg font-bold">
            <BsArrowUpRight />
            <p>{t("send")}</p>
          </span>
        </Button>
        <Button onClick={() => navigate(RECEIVE)} variant="text" classname="w-1/2  md:w-1/3 px-1 m-0">
          <span className="flex items-center gap-1 text-base md:text-lg font-bold">
            <BsArrowDownLeft />
            <p>{t("receive")}</p>
          </span>
        </Button>
        <Button isDisabled={!isSwapAvailable} onClick={() => navigate(SWAP)} variant="text" classname="w-1/2  md:w-1/3 px-1 m-0">
          <span className="flex items-center gap-1 text-base md:text-lg font-bold">
            <RiTokenSwapLine />
            <p>{t("swap")}</p>
          </span>
        </Button>
      </div>
    </div>
  );
};
