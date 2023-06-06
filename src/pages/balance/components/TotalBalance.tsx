import { FC, useEffect, useState } from "react";
import {
  BsArrowUpRight,
  BsArrowDownLeft,
  BsFillEyeSlashFill,
  BsEyeFill,
} from "react-icons/bs";
import { useTranslation } from "react-i18next";
import { formatAmountWithDecimals } from "@src/utils/assets";
import { useNavigate } from "react-router-dom";
import { SEND, RECEIVE } from "@src/routes/paths";
import {
  useAccountContext,
  useAssetContext,
  useThemeContext,
} from "@src/providers";

interface TotalBalanceProps {
  balance?: number;
  accountName?: string;
}

export const TotalBalance: FC<TotalBalanceProps> = () => {
  const { t } = useTranslation("balance");
  const navigate = useNavigate();
  const { color } = useThemeContext();

  const [isEditing, setIsEditing] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [showBalance, setShowBalance] = useState(true);

  const {
    state: { selectedAccount },
    updateAccountName,
  } = useAccountContext();

  const {
    state: { assets },
  } = useAssetContext();

  const totalBalance = assets.reduce(
    (total, item) => total + (item.amount || 0),
    0
  );

  const update = async () => {
    setIsEditing(false);
    if (!accountName || accountName.trim() === "") {
      setAccountName(selectedAccount.value.name);
      return;
    }

    updateAccountName(selectedAccount.key, accountName);
  };

  const toggleBalance = () => setShowBalance(!showBalance);

  useEffect(() => {
    if (selectedAccount?.value?.name) {
      setAccountName(selectedAccount.value.name);
    }
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
          <p className="text-2xl">$</p>
          <p className="text-5xl" data-testid="balance">
            {showBalance ? formatAmountWithDecimals(totalBalance, 5) : "***"}
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
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => navigate(SEND)}
          className={`flex gap-1 items-center text-${color}-primary font-bold text-lg px-3 py-1 rounded-2xl hover:bg-custom-gray-bg hover:bg-opacity-40`}
        >
          <BsArrowUpRight />
          <p>{t("send")}</p>
        </button>
        <button
          onClick={() => navigate(RECEIVE)}
          className={`flex gap-1 items-center text-${color}-primary font-bold text-lg px-3 py-1 rounded-2xl hover:bg-custom-gray-bg hover:bg-opacity-40`}
        >
          <BsArrowDownLeft />
          <p>{t("receive")}</p>
        </button>
      </div>
    </div>
  );
};
