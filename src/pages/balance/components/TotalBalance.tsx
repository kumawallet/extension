import { FC } from "react";
import { BsArrowUpRight, BsArrowDownLeft } from "react-icons/bs";
import { useTranslation } from "react-i18next";
import { formatAmountWithDecimals } from "@src/utils/assets";
import { useNavigate } from "react-router-dom";
import { SEND, RECEIVE } from "@src/routes/paths";

interface TotalBalanceProps {
  balance?: number;
  accountName?: string;
}

export const TotalBalance: FC<TotalBalanceProps> = ({
  balance = 0,
  accountName = "",
}) => {
  const { t } = useTranslation("balance");
  const navigate = useNavigate();

  return (
    <div className="mx-auto">
      <div className="flex items-center justify-center">
        <p className="text-2xl mb-4">{accountName || ""}</p>
      </div>
      <div className="flex mb-4 gap-2 items-center justify-center">
        <p className="text-2xl">$</p>
        <p className="text-5xl">{formatAmountWithDecimals(balance, 5)}</p>
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => navigate(SEND)}
          className="flex gap-1 items-center text-custom-green-bg font-bold text-lg"
        >
          <BsArrowUpRight />
          <p>{t("send")}</p>
        </button>
        <button
          onClick={() => navigate(RECEIVE)}
          className="flex gap-1 items-center text-custom-green-bg font-bold text-lg">
          <BsArrowDownLeft />
          <p>{t("receive")}</p>
        </button>
      </div>
    </div>
  );
};
