import { useEffect } from "react";
import { useAccountContext } from "@src/providers";
import { AccountList } from "./AccountList";
import { useNetworkContext } from "@src/providers";
// import { AccountSelected } from "./AccountSelected";

export const Account = () => {
  const {
    state: { selectedAccount },
    getSelectedAccount,
    getAllAccounts,
  } = useAccountContext();

  const {
    state: { init, selectedChain },
  } = useNetworkContext();

  useEffect(() => {
    if (!selectedAccount?.value && init) {
      (async () => {
        await getSelectedAccount();
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

  return (
    <div className="flex gap-2 items-center">
      <AccountList />
    </div>
  );
};
