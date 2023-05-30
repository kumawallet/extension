import { FC, useEffect, useState } from "react";
import { BsArrowUpRight, BsArrowDownLeft } from "react-icons/bs";
import { useTranslation } from "react-i18next";
import { formatAmountWithDecimals } from "@src/utils/assets";
import { useNavigate } from "react-router-dom";
import { SEND, RECEIVE } from "@src/routes/paths";
import { useAccountContext, useAssetContext } from "@src/providers";
import Extension from "@src/Extension";

interface TotalBalanceProps {
  balance?: number;
  accountName?: string;
}

export const TotalBalance: FC<TotalBalanceProps> = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [accountName, setAccountName] = useState("");
  const { t } = useTranslation("balance");

  const {
    state: { selectedAccount },
    updateAccountName,
  } = useAccountContext();

  useEffect(() => {
    if (selectedAccount?.value?.name) {
      setAccountName(selectedAccount.value.name);
    }
  }, [selectedAccount]);

  const {
    state: { assets },
  } = useAssetContext();

  const navigate = useNavigate();

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

  return (
    <div className="mx-auto">
      <div className="flex items-center justify-center mb-4">
        {!isEditing ? (
          <p
            className="text-center text-2xl cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            {accountName}
          </p>
        ) : (
          <input
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
        <p className="text-2xl">$</p>
        <p className="text-5xl" data-testid="balance">
          {formatAmountWithDecimals(totalBalance, 5)}
        </p>
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => navigate(SEND)}
          className="flex gap-1 items-center text-custom-green-bg font-bold text-lg px-3 py-1 rounded-2xl hover:bg-custom-gray-bg hover:bg-opacity-40"
        >
          <BsArrowUpRight />
          <p>{t("send")}</p>
        </button>
        <button
          onClick={() => navigate(RECEIVE)}
          className="flex gap-1 items-center text-custom-green-bg font-bold text-lg px-3 py-1 rounded-2xl hover:bg-custom-gray-bg hover:bg-opacity-40"
        >
          <BsArrowDownLeft />
          <p>{t("receive")}</p>
        </button>
      </div>
    </div>
  );
};
