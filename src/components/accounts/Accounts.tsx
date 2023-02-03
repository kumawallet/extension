import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAccountContext } from "@src/providers";
import { Menu } from "@headlessui/react";
import { Account } from "@src/utils/storage/entities/Accounts";
import { AccountType } from "@src/utils/AccountManager";
import { IMPORT_ACCOUNT } from "@src/routes/paths";
import { DERIVE_ACCOUNT } from "../../routes/paths";

export const Accounts = () => {
  const navigate = useNavigate();
  const {
    state: { selectedAccount, accounts },
    getAllAccounts,
    setSelectedAccount,
  } = useAccountContext();

  useEffect(() => {
    getAllAccounts();
  }, []);

  const changeSelectedAccount = (account: Account) => {
    setSelectedAccount(account);
  };

  const format = (type: AccountType) => {
    switch (type) {
      case AccountType.IMPORTED_EVM:
        return "EVM (Imported)";
      case AccountType.EVM:
        return "EVM";
      case AccountType.IMPORTED_WASM:
        return "WASM (Imported)";
      case AccountType.WASM:
        return "WASM";
    }
  };

  return (
    <>
      <div className="flex justify-between mb-6 mt-3">
        <button
          onClick={() => navigate(IMPORT_ACCOUNT)}
          className="border border-custom-green-bg text-white rounded-xl py-2 transition duration-500 ease select-none hover:bg-custom-green-bg focus:outline-none focus:shadow-outline w-[40%]"
        >
          Import
        </button>
        <button
          onClick={() => navigate(DERIVE_ACCOUNT)}
          className="border border-custom-green-bg text-white rounded-xl py-2 transition duration-500 ease select-none hover:bg-custom-green-bg focus:outline-none focus:shadow-outline w-[40%]"
        >
          Create
        </button>
      </div>
      <div className="flex flex-col gap-5">
        <Menu.Item>
          {({ close }) => (
            <>
              {accounts.map((account) => (
                <div
                  key={account?.value?.address}
                  className={`${
                    selectedAccount?.value?.address ===
                      account?.value?.address && "bg-gray-400 bg-opacity-30"
                  }  bg-opacity-30 flex justify-between rounded-lg py-2 px-4 text-white cursor-pointer`}
                  onClick={() => {
                    changeSelectedAccount(account);
                    close();
                  }}
                >
                  <p className="w-3/4 overflow-hidden text-ellipsis">
                    <p className="text-lg font-bold">{account?.value?.name}</p>
                    <p>{account?.value?.address}</p>
                  </p>
                  <p>{format(account?.type)}</p>
                </div>
              ))}
            </>
          )}
        </Menu.Item>
      </div>
    </>
  );
};
