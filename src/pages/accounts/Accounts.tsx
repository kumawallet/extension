import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAccountContext } from "@src/providers";
import { Menu } from "@headlessui/react";
import { IMPORT_ACCOUNT } from "@src/routes/paths";
import { DERIVE_ACCOUNT } from "../../routes/paths";
import { transformAddress } from "../../utils/account-utils";
import { useNetworkContext } from "../../providers/NetworkProvider";
import Account from "@src/storage/entities/Account";

export const Accounts = () => {
  const { t } = useTranslation("balance");
  const navigate = useNavigate();

  const {
    state: { selectedChain },
  } = useNetworkContext();

  const {
    state: { selectedAccount, accounts },

    setSelectedAccount,
  } = useAccountContext();

  const changeSelectedAccount = (account: Account) => {
    setSelectedAccount(account);
  };

  const filteredAccounts = useMemo(() => {
    const acc = accounts.map((acc) => ({
      ...acc,
      value: {
        ...acc.value,
        address: transformAddress(
          acc.value?.address,
          selectedChain?.addressPrefix
        ),
      },
    }));

    return acc;
  }, [accounts, selectedChain?.name]);

  return (
    <>
      <div className="flex justify-between mb-6 mt-3">
        <button
          onClick={() => navigate(IMPORT_ACCOUNT)}
          className="border border-custom-green-bg text-white rounded-xl py-2 transition duration-500 ease select-none hover:bg-custom-green-bg focus:outline-none focus:shadow-outline w-[40%]"
        >
          {t("accounts.import")}
        </button>
        <button
          onClick={() => navigate(DERIVE_ACCOUNT)}
          className="border border-custom-green-bg text-white rounded-xl py-2 transition duration-500 ease select-none hover:bg-custom-green-bg focus:outline-none focus:shadow-outline w-[40%]"
        >
          {t("accounts.create")}
        </button>
      </div>
      <div className="flex flex-col gap-5">
        <Menu.Item>
          {({ close }) => (
            <>
              {filteredAccounts.map((account) => (
                <div
                  key={account?.key}
                  className={`${
                    selectedAccount?.key === account?.key &&
                    "bg-gray-400 bg-opacity-30"
                  }  bg-opacity-30 flex justify-between rounded-lg py-2 px-4 text-white cursor-pointer`}
                  onClick={() => {
                    changeSelectedAccount(account as Account);
                    close();
                  }}
                >
                  <p className="w-3/4 overflow-hidden text-ellipsis">
                    <p className="text-lg font-medium">
                      {account?.value?.name}
                    </p>
                    <p>{account?.value?.address}</p>
                  </p>
                </div>
              ))}
            </>
          )}
        </Menu.Item>
      </div>
    </>
  );
};
