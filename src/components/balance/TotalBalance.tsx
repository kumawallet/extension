import { BsArrowUpRight, BsArrowDownLeft } from "react-icons/bs";
import { useTranslation } from "react-i18next";

export const TotalBalance = ({
  balance = 0,
  accountName = "Account 1",
}: {
  balance: number;
  accountName: string;
}) => {
  const { t } = useTranslation("balance");

  return (
    <div className="mx-auto">
      <div className="flex items-center justify-center">
        <p className="text-2xl mb-6">{accountName}</p>
      </div>
      <div className="flex mb-8 gap-2 items-center justify-center">
        <p className="text-2xl">$</p>
        <p className="text-5xl">{balance}</p>
      </div>
      <div className="flex gap-3 justify-center">
        <button className="flex gap-1 items-center text-custom-green-bg font-bold text-lg">
          <BsArrowUpRight />
          <p>{t("send")}</p>
        </button>
        <button className="flex gap-1 items-center text-custom-green-bg font-bold text-lg">
          <BsArrowDownLeft />
          <p>{t("receive")}</p>
        </button>
      </div>
    </div>
  );
};
