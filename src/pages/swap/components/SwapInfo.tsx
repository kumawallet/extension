import { FC, useMemo , useState } from "react";
import { TxInfoState, swapType } from "../hooks";
import { useTranslation } from "react-i18next";
import { cropAccount } from "@src/utils/account-utils";
import { AiOutlineEdit } from "react-icons/ai";
import { SlippageModal } from "./SlippageModal";
import { FormProvider, useForm } from "react-hook-form";

type SwapInfoProps = TxInfoState & {
  setSlippage: (val: number) => void;
};

export const _slippage: { [key: string]: string } = {
  "0.001": "0.1%",
  "0.005": "0.5%",
  "0.01": "1%",
  "0.03": "3%",
};

export const HYDRADX_ASSETS: { [key: string]: string } = {
  "0": "HDX",
  "5": "DOT",
  "9": "ASTR",
  "16": "GLMR",
  "20": "WETH",
  "101": "2-Pool",
  "102": "2-Pool",
  "100": "4-Pool",
  "1000019": "DED",
  "2": "DAI",
  "22": "USDC",
  "13": "CFG",
  "17": "INTR",
  "14": "BNC",
  "6": "APE",
  "24": "SUB",
  "15": "vDOT",
  "10": "USDT",
  "1": "H2O",
  "18": "DAI",
  "21": "USDC",
  "23": "USDT",
  "3": "WBTC",
  "11": "iBTC",
  "1000021": "PINK",
  "1000099": "ACA",
  "1000100": "LDOT",
  "1000036": "BEEFY",
  "1000034": "STINK",
  "1000085": "WUD",
  "1000148": "BORK",
  "8": "PHA",
  "28": "KILT",
  "12": "ZTG",
  "27": "CRU",
  "31": "RING",
  "25": "UNQ",
  "1000082": "WIFD",
  "30": "MYTH",
  "1000199": "KOL",
};

interface swap {
  amountIn: string;
  amountOut: string;
  assetIn: string;
  assetInDecimals: number;
  assetOut: string;
  assetOutDecimals: number;
  calculatedOut: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any[];
  pool: string;
  poolAddress: string;
  priceImpactPct: number;
  spotPrice: string;
  tradeFeePct: number;
}

export const SwapInfo: FC<SwapInfoProps> = ({
  bridgeFee,
  bridgeName,
  destinationAddress,
  gasFee,
  bridgeType,
  swapInfo,
  setSlippage,
}) => {
  const { t } = useTranslation("swap");

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const methods = useForm({
    defaultValues: {
      slippage: "",
    },
  });

  const _bridgeName = useMemo(() => {
    if (bridgeName === swapType.stealhex) {
      return (
        <a
          href="https://stealthex.io/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            className="bg-[#fde936] p-1"
            src="/images/stealthex.svg"
            alt="Stealthex"
            width={90}
          />
        </a>
      );
    } else if (bridgeName === swapType.hydradx) {
      return (
        <a
          href="https://hydration.net/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            className="p-1"
            src="/icons/hydration.svg"
            alt="hydradx"
            width={90}
          />
        </a>
      );
    }

    return <p>{bridgeName}</p>;
  }, [bridgeName]);

  return (
    <div className="bg-[#343a40] border border-[#727e8b17] p-3 rounded-lg flex flex-col gap-2">
      {bridgeType && (
        <>
          <div className="flex justify-between items-center text-[#A3A3A3]">
            <p>{t(`${bridgeType}_name`.toLocaleLowerCase())}:</p>
            {_bridgeName}
          </div>
          <div className="flex justify-between items-center text-[#A3A3A3]">
            <p>{t(`${bridgeType}_fee`.toLocaleLowerCase())}:</p>
            <p>{bridgeFee}</p>
          </div>
        </>
      )}

      {gasFee && (
        <div className="flex justify-between items-center text-[#A3A3A3]">
          <p>{t("gas_fee")}:</p>
          <p>{gasFee}</p>
        </div>
      )}

      {destinationAddress && (
        <div className="flex justify-between items-center text-[#A3A3A3]">
          <p>{t("destination_address")}:</p>
          <p>{cropAccount(destinationAddress as string)}</p>
        </div>
      )}
      {bridgeName === swapType.hydradx && swapInfo && (
        <div className="flex justify-between items-center text-[#A3A3A3]">
          <p >{t("router_swap")}</p>
          <div className="flex gap-2">
            {swapInfo.swaps.map((router: swap, index: number) => (
              <div
                key={index}
                className={`flex  items-center gap-1 ${
                  swapInfo.swaps.length > 4 && "text-[10px]"
                }`}
              >
                {index === 0 ? (
                  <>
                    <p>{HYDRADX_ASSETS[router.assetIn] || router.assetIn}</p>
                    <p>{">"}</p>
                    <p>{HYDRADX_ASSETS[router.assetOut] || router.assetOut}</p>
                  </>
                ) : (
                  <>
                    <p>{">"}</p>
                    <p>{HYDRADX_ASSETS[router.assetOut] || router.assetOut}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {bridgeName === swapType.hydradx && swapInfo && swapInfo.slippage && (
        <div className="flex justify-between items-center text-[#A3A3A3]">
          <p>{t("slippage")}</p>
          <div className="flex gap-2">
            <p>
              {_slippage[String(swapInfo.slippage)] ||
                `${swapInfo.slippage * 100}%`}
            </p>
            <button data-testid="edit-button" onClick={() => setIsOpen(true)}>
              <AiOutlineEdit />
            </button>
          </div>
        </div>
      )}
      {swapInfo && (
        <FormProvider {...methods}>
          <SlippageModal
            isOpen={isOpen}
            onClose={() => setIsOpen(!isOpen)}
            setSlippage={(val: number) => setSlippage(val)}
            slippag={swapInfo.slippage.toString()}
            data-testid="slippage-modal"

          />
        </FormProvider>
      )}
    </div>
  );
};
