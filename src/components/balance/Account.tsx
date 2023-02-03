import { useEffect } from "react";
import { FiCopy } from "react-icons/fi";
import { cropAccount } from "../../utils/account-utils";
import { useAccountContext } from "../../providers/AccountProvider";
import { AccountManage } from "./AccountManage";

export const Account = () => {
  const {
    state: { selectedAccount },
    getSelectedAccount,
  } = useAccountContext();

  useEffect(() => {
    getSelectedAccount();
  }, []);

  const account = cropAccount(selectedAccount?.value?.address || "");

  const copyAccount = () => {
    // TODO: fire popup
    navigator.clipboard.writeText(selectedAccount?.value?.address || "");
  };

  return (
    <div className="flex gap-2 items-center">
      <button className="flex items-center gap-1" onClick={copyAccount}>
        <FiCopy />
        <p className="text-custom-green-bg">{account}</p>
      </button>

      <AccountManage />
    </div>
  );
};
