import { useState } from "react";
import Extension, { AccountType } from "../../utils/Extension";
import { PageWrapper } from "../common/PageWrapper";
import { BsArrowLeftShort } from "react-icons/bs";

export const Accounts = () => {
  const ext = new Extension({}, AccountType.EVM);

  const [accounts, setAccounts] = useState(() => {
    const accounts = ext.getAllAccounts();
    return accounts;
  });

  return (
    <PageWrapper>
      <div className="flex  items-center mb-14">
        <BsArrowLeftShort size={20} />
        <p className="font-medium text-2xl">Accounts</p>
      </div>
      <div>
        {accounts.map((account) => (
          <div>{JSON.stringify(account)}</div>
        ))}
      </div>
    </PageWrapper>
  );
};
