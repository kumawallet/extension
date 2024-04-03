import { useFormContext } from 'react-hook-form'
import { SendTxForm } from '../Send'
import { formatFees } from '@src/utils/assets'
import { useTranslation } from 'react-i18next'
import { RxChevronRight } from "react-icons/rx";
import { cropAccount } from '@src/utils/account-utils';

export const TxResume = () => {
  const { t } = useTranslation('send')

  const { getValues } = useFormContext<SendTxForm>()

  const transaction = {
    sender: cropAccount(getValues('senderAddress'), 12),
    to: cropAccount(getValues('recipientAddress'), 12),
    network: <div className='flex flex-col h-full'>
      <div className="flex items-center gap-1 h-full">
        <img src={getValues("originNetwork").logo} width={12} />
        <RxChevronRight size={12} />
        <img src={getValues("targetNetwork").logo} width={12} />
      </div>
      {
        getValues("originNetwork").id !== getValues("targetNetwork").id && (
          <span className='text-xs'>{t("transer_using_xcm")}</span>
        )
      }
    </div>,
    amount: `${getValues("amount")} ${getValues("asset.symbol")}`,
    estimated_fee: <div className='flex items-center'>
      {formatFees(
        getValues("fee"),
        getValues("originNetwork.decimals")
      )}{" "}
      {getValues("originNetwork.symbol")}
    </div>,
    tip_review: `${getValues("tip")} ${getValues("originNetwork.symbol")}`
  }

  return (
    <div className='grid grid-cols-[34%_66%] gap-y-5'>
      {
        Object.entries(transaction).map(([key, value]) => (
          <>
            <div className='text-sm'>{t(key)}</div>
            <div className='text-sm text-[#9CA3AF]'>{value}</div>
          </>
        ))
      }
    </div>
  )
}
