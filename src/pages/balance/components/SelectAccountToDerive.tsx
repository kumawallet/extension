import { type FC, useState, useEffect } from "react";
import Account from "@src/storage/entities/Account";
import { Wallet } from "./Wallet";
import { messageAPI } from "@src/messageAPI/api";

interface SelectAccountToDeriveProps {
  onSelect: (account: Account) => void;
}

export const SelectAccountToDerive: FC<SelectAccountToDeriveProps> = ({
  onSelect,
}) => {
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [accountSelected, setAccountSelected] = useState<Account | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const accounts = await messageAPI.getAccountstToDerive();

        setAccounts(accounts);
      } catch (error) {
        //
      }
    })();
  }, []);

  return (
    <div data-testid="wallets-container" className="flex flex-col gap-2">
      {accounts?.map((account) => (
        <Wallet
          key={account.key}
          address={account.value!.address}
          name={account.value!.name}
          type={account.type}
          onSelect={() => {
            onSelect(account);
            setAccountSelected(account);
          }}
          showCopyIcon={false}
          showSelectedIcon
          isSelected={accountSelected?.key === account.key}
        />
      ))}
    </div>
  );
};
