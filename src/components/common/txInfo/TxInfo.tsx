import { FC } from "react";
import { Button } from "@src/components/common";
import { useTranslation } from "react-i18next";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useThemeContext } from "@src/providers";
import { FiChevronLeft } from "react-icons/fi";
import { Fees } from "@src/pages/send/components/Fees";
import { ChainInfo } from "./ChainInfo";
import { AssetInfo } from "./AssetInfo";

interface TxInfoProps {
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
  chainFrom: {
    name: string;
    image: string;
  };
  chainTo: {
    name: string;
    image: string;
  };
  addressFrom: string;
  addressTo: string;
  amountFrom: string;
  amountTo: string;
  assetFrom: {
    symbol: string;
    image: string | null;
  };
  assetTo: {
    symbol: string;
    image: string | null;
  };
  fee: {
    estimatedFee: string;
    estimatedTotal: string;
    gasLimit?: string;
  }
}

export const TxInfo: FC<TxInfoProps> = ({
  addressFrom,
  addressTo,
  amountFrom,
  amountTo,
  assetFrom,
  assetTo,
  chainFrom,
  chainTo,
  isLoading,
  onConfirm,
  fee,
  onBack

}) => {
  const { t } = useTranslation("send");
  const { color } = useThemeContext();

  return (
    <div className="mx-auto px-2">
      <div className="flex gap-3 items-center mb-7">
        <FiChevronLeft
          size={26}
          className="cursor-pointer"
          onClick={onBack}
        />

        <p className="text-xl">{t("transfer")}</p>
      </div>
      <div className="mb-5">
        {<p className="mb-2">{t("chains")}:</p>}{" "}
        <div
          className="flex justify-around items-center bg-[#212529] rounded-xl py-3 px-5 gap-1"
          style={{
            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
          }}
        >
          <ChainInfo
            chain={chainFrom}
            address={addressFrom}
            dataTestId="origin-chain"
          />
          <div className="flex gap-1">
            <FaChevronLeft />
            <FaChevronRight />
          </div>
          <ChainInfo
            chain={chainTo}
            address={addressTo}
            dataTestId="destination-chain"
          />
        </div>
      </div>
      <div className="mb-5">
        <p>{t("assets")}:</p>
        <div className="flex justify-around items-center bg-[#343A40] rounded-xl py-3 px-5">
          <AssetInfo
            asset={assetFrom}
            amount={amountFrom}
            dataTestId="origin-asset"
          />
          <div className="flex gap-1">
            <FaChevronLeft />
            <FaChevronRight />
          </div>
          <AssetInfo
            asset={assetTo}
            amount={amountTo}
            dataTestId="destination-asset"
          />
        </div>
      </div>
      <div className="mb-5">
        <p>{t("details")}:</p>
        <div className="flex bg-[#343A40] rounded-xl py-3 px-5 w-full">
          <Fees
            {...fee}
          />
        </div>
      </div>
      <Button
        classname={`font-medium text-base bg-${color}-primary w-full py-2 md:py-4 rounded-md`}
        onClick={onConfirm}
        isLoading={isLoading}
        isDisabled={isLoading}
      >
        {t("confirm")}
      </Button>
    </div>
  );
};
