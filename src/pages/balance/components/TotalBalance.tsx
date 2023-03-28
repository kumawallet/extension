import { FC } from "react";
import { BsArrowUpRight, BsArrowDownLeft } from "react-icons/bs";
import { useTranslation } from "react-i18next";
import { formatAmountWithDecimals } from "@src/utils/assets";
import { useNavigate } from "react-router-dom";
import { SEND, RECEIVE } from "@src/routes/paths";
import { useAccountContext } from "@src/providers";

interface TotalBalanceProps {
  balance?: number;
  accountName?: string;
}

export const TotalBalance: FC<TotalBalanceProps> = () => {
  const { t } = useTranslation("balance");

  const {
    state: { selectedAccount },
  } = useAccountContext();

  const navigate = useNavigate();

  return (
    <div className="mx-auto">
      <div className="flex items-center justify-center">
        <p className="text-2xl mb-4">{selectedAccount?.value?.name || ""}</p>
      </div>
      <div className="flex mb-4 gap-2 items-center justify-center">
        <p className="text-2xl">$</p>
        <p className="text-5xl">{formatAmountWithDecimals(0, 5)}</p>
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
