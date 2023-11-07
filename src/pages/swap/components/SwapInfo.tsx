import { FC } from "react"
import { TxInfoState } from "../hooks"
import { useTranslation } from "react-i18next"
import { cropAccount } from "@src/utils/account-utils"
import { useNetworkContext } from "@src/providers"

type SwapInfoProps = TxInfoState

export const SwapInfo: FC<SwapInfoProps> = ({
  bridgeFee,
  bridgeName,
  destinationAddress,
  gasFee
}) => {
  const { t } = useTranslation("swap")
  const { state: { selectedChain } } = useNetworkContext()

  return (
    <div className="bg-[#303943] p-3 rounded-xl flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <p>{t("bridge_name")}:</p>
        <p>{bridgeName}</p>
      </div>

      <div className="flex justify-between items-center">
        <p>{t("bridge_fee")}:</p>
        <p>{bridgeFee}</p>
      </div>

      <div className="flex justify-between items-center">
        <p>{t("gas_fee")}:</p>
        <p>{gasFee} {selectedChain?.nativeCurrency?.symbol || ""}</p>
      </div>

      <div className="flex justify-between items-center">
        <p>{t("destination_address")}:</p>
        <p>{cropAccount(destinationAddress)}</p>
      </div>
    </div>
  )
}
