import { FC, useMemo } from "react";
import { TxInfoState } from "../hooks";
import { useTranslation } from "react-i18next";
import { cropAccount } from "@src/utils/account-utils";
import { useNetworkContext } from "@src/providers";

type SwapInfoProps = TxInfoState;


export const SwapInfo: FC<SwapInfoProps> = ({
  bridgeFee,
  bridgeName,
  destinationAddress,
  gasFee,
  bridgeType
}) => {
  const { t } = useTranslation("swap");
  const {
    state: { selectedChain },
  } = useNetworkContext();

  const _bridgeName = useMemo(() => {
    if (bridgeName === "stealthex") {
      return (

        <a href="https://stealthex.io/" target="_blank" rel="noopener noreferrer">
          <img
            className="bg-[#fde936] p-1"
            src="/images/stealthex.svg"
            alt="Stealthex"
            width={90}
          />
        </a>
      )
        ;
    }

    return <p>{bridgeName}</p>;
  }, [bridgeName]);

  return (
    <div className="bg-[#303943] p-3 rounded-xl flex flex-col gap-2">
      {
        bridgeType && (
          <>
            <div className="flex justify-between items-center">
              <p>{t(`${bridgeType}_name`)}:</p>
              {_bridgeName}
            </div>
            <div className="flex justify-between items-center">
              <p>{t(`${bridgeType}_fee`)}:</p>
              <p>{bridgeFee}</p>
            </div>
          </>
        )
      }

      {gasFee && (
        <div className="flex justify-between items-center">
          <p>{t("gas_fee")}:</p>
          <p>
            {gasFee} {selectedChain?.nativeCurrency?.symbol || ""}
          </p>
        </div>
      )}

      {destinationAddress && (
        <div className="flex justify-between items-center">
          <p>{t("destination_address")}:</p>
          <p>{cropAccount(destinationAddress as string)}</p>
        </div>
      )}
    </div>
  );
};
