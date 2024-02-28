import { type FC, useState } from 'react'
import { useAccountContext } from '@src/providers'
import Account from '@src/storage/entities/Account'
import { Wallet } from './Wallet'

interface SelectAccountToDeriveProps {
  onSelect: (account: Account) => void
}

export const SelectAccountToDerive: FC<SelectAccountToDeriveProps> = ({
  onSelect
}) => {
  const { state: { accounts } } = useAccountContext()

  const [accountSelected, setAccountSelected] = useState<Account | null>(null)


  return (
    <div className='flex flex-col gap-2'>
      {
        accounts?.map((account) => (
          <Wallet
            key={account.key}
            address={account.value.address}
            name={account.value.name}
            type={account.type}
            onSelect={() => {
              onSelect(account)
              setAccountSelected(account)
            }}
            showCopyIcon={false}
            showSelectedIcon
            isSelected={accountSelected?.key === account.key}
          />
        ))
      }
    </div>
  )
}
