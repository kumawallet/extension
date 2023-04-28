import { Fragment, useMemo } from "react";
import { Menu, Transition } from "@headlessui/react";
import logo from "/logo.svg";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAccountContext, useNetworkContext } from "@src/providers";
import Account from "@src/storage/entities/Account";
import { transformAddress } from "@src/utils/account-utils";
import { DERIVE_ACCOUNT, IMPORT_ACCOUNT } from "@src/routes/paths";
import { SiEthereum, SiWebassembly } from "react-icons/si";

export const AccountList = () => {
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
    const acc = accounts?.map((acc) => ({
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

  const chainSupportMultipleAccountTypes =
    selectedChain?.supportedAccounts &&
    selectedChain?.supportedAccounts.length > 1;

  return (
    <Menu>
      <Menu.Button data-testid="account-button">
        <div className="flex justify-center items-center rounded-full bg-[#212529] p-2 cursor-pointer">
          <img className="w-5 h-5" src={logo} />
        </div>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="right-0 absolute origin-top-right top-12 w-full max-w-lg bg-[#29323C] rounded-xl ring-0 outline-0 max-h-[90vh] overflow-auto z-50 scroll-accounts-list">
          <div className="text-start py-2 pt-2 px-4">
            <p className="py-4 text-2xl font-medium">
              {t("accounts.accounts")}
            </p>
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
                        }  bg-opacity-30 flex rounded-lg py-2 px-4 text-white cursor-pointer items-center gap-3 hover:bg-gray-400 hover:bg-opacity-30 transition`}
                        onClick={() => {
                          changeSelectedAccount(account as Account);
                          close();
                        }}
                      >
                        {chainSupportMultipleAccountTypes &&
                          (account.type.includes("EVM") ? (
                            <SiEthereum size={22} />
                          ) : (
                            <SiWebassembly size={22} />
                          ))}
                        <div className="overflow-hidden text-ellipsis">
                          <p className="text-lg font-medium">
                            {account?.value?.name}
                          </p>
                          <p>{account?.value?.address}</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </Menu.Item>
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
