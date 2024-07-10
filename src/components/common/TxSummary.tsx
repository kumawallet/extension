import { FC, Fragment, useEffect } from 'react';


interface TxSummaryProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: Record<string, any>
}

export const TxSummary: FC<TxSummaryProps> = ({
  tx,
}) => {
  return (
    <div className='grid grid-cols-[32%_68%] gap-y-4 h-fit'>
      {
        Object.entries(tx).map(([key, value]) => ( 
          value && <Fragment key={key}>
            <div className='text-sm'>{key}</div>
            <div className='text-sm text-[#9CA3AF] overflow-auto text-ellipsis'>{value}</div>
          </Fragment>
        ))
      }
    </div>
  )
}
