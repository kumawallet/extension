import { useEffect } from "react";
import { FiCopy } from "react-icons/fi";
import { cropAccount } from "../../utils/account-utils";
import { useAccountContext } from "../../providers/AccountProvider";
import { AccountManage } from "./AccountManage";
import { useNetworkContext } from "@src/providers";

export const Account = () => {
  const {
    state: { selectedAccount },
    getSelectedAccount,
    getAllAccounts,
  } = useAccountContext();

  const {
    state: { init, selectedChain },
    getSelectedNetwork,
  } = useNetworkContext();

  useEffect(() => {
    if (!selectedAccount?.value && init) {
      (async () => {
        await getSelectedAccount();

        // if (selectedChain) {
        //   await getAllAccounts(selectedChain?.supportedAccounts);
        // } else {
        //   await getAllAccounts(account.type);
        // }
      })();
    }
  }, [selectedAccount?.value, init]);

  useEffect(() => {
    if (selectedChain) {
      (async () => {
        await getAllAccounts(selectedChain?.supportedAccounts);
      })();
    }
  }, [selectedChain]);

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
