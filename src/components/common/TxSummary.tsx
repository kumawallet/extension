import { FC, Fragment } from 'react'
import { useTranslation } from 'react-i18next'

interface TxSummaryProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: Record<string, any>
}

export const TxSummary: FC<TxSummaryProps> = ({
  tx
}) => {
  const { t } = useTranslation('send')


  return (
    <div className='grid grid-cols-[34%_66%] gap-y-5'>
      {
        Object.entries(tx).map(([key, value]) => (
          <Fragment key={key}>
            <div className='text-sm'>{t(key)}</div>
            <div className='text-sm text-[#9CA3AF]'>{value}</div>
          </Fragment>
        ))
      }
    </div>
  )
}
