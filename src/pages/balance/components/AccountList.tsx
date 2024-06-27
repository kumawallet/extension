import { Fragment, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { useAccountContext } from "@src/providers";
import Account from "@src/storage/entities/Account";
import { Button } from "@src/components/common";
import { GoChevronDown } from "react-icons/go";
import { Wallet } from "./Wallet";
import { CreateWalletFromInside } from "./CreateWalletFromInside";
import { ImportWalletFromInside } from "./ImportWalletFromInside";
import { AccountDetails } from "./AccountDetails";
import { TfiClose } from "react-icons/tfi";
import { IconWallet } from "@src/components/icons/wallet";

export const AccountList = () => {
  const { t } = useTranslation("balance");
  const { t: tAccount } = useTranslation("account");

  const [isOpen, setIsOpen] = useState(false);

  const [actionSelected, setActionSelected] = useState<
    "create" | "import" | "detail" | null
  >(null);

  const {
    state: { selectedAccount, accounts },
    setSelectedAccount,
    getAllAccounts,
  } = useAccountContext();

  const [accountData, setAccountData] = useState<Account | null>(null);

  const filteredAccounts = useMemo(() => {
    const acc = accounts?.map((acc) => ({
      ...acc,
    }));

    return acc;
  }, [accounts]);

  const onFinshCreatingOrImporting = () => {
    setActionSelected(null);
    getAllAccounts();
  };

  const onCloseModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setActionSelected(null);
    }, 500);
  };

  return (
    <div className="flex gap-2 items-center">
      <button data-testid="account-button" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center bg-[#212529] gap-1 hover:bg-gray-500 hover:bg-opacity-20 px-2 py-1 rounded-xl">
          <div className="p-1 bg-[#343A40] mr-[0.1rem]  rounded-full">
            <IconWallet size="18" />
          </div>
          <p
            data-testid="selected-account"
            className="text-primary-default text-base"
          >
            {selectedAccount?.value?.name ? selectedAccount?.value?.name : t("accounts.accounts")}
          </p>
          <GoChevronDown size={14} />
        </div>
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onCloseModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex justify-center min-h-full text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-[357px] transform overflow-hidden rounded-b-2xl bg-[#171720]  p-4 text-left align-middle shadow-xl h-fit transition-all">
                  <div className="py-2 px-4">
                    {!actionSelected ? (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-base md:text-xl">
                            {t("accounts.accounts")}
                          </p>
                          <button onClick={onCloseModal}>
                            <TfiClose className="text-sm" />
                          </button>
                        </div>

                        <div
                          data-testid="wallet-list"
                          className="flex flex-col gap-5"
                        >
                          <button
                            className={`flex items-center px-6 py-4 bg-[#1C1C27] rounded-lg ${!selectedAccount?.value
                              ? "border border-[#2CEC84]"
                              : ""
                              }`}
                            onClick={() => {
                              setSelectedAccount(null)
                              onCloseModal()
                            }}
                          >
                            <div className={` flex gap-4 items-center overflow-hidden text-ellipsis`}>
                              <IconWallet size="15" />
                              <span>{t("accounts.all_accounts")}</span>
                            </div>
                          </button>

                          {filteredAccounts.map((account) => (
                            <Wallet
                              key={account?.key}
                              address={account?.value!.address}
                              name={account?.value!.name}
                              type={account?.type}
                              more={() => {
                                setAccountData(account);
                                setActionSelected("detail");
                              }}
                              onSelect={() => {

                                setSelectedAccount(account as Account);
                                onCloseModal()
                              }}
                              isSelected={
                                selectedAccount
                                  ? account?.key === selectedAccount?.key
                                  : false
                              }
                            />
                          ))}
                        </div>

                        <div className="flex justify-between my-6">
                          <Button
                            data-testid="create-button"
                            classname="!w-[48%] py-3"
                            onClick={() => setActionSelected("create")}
                          >
                            {t("accounts.create")}
                          </Button>
                          <Button
                            data-testid="import-button"
                            classname="!w-[48%] py-3"
                            onClick={() => setActionSelected("import")}
                          >
                            {t("accounts.import")}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        {actionSelected === "create" && (
                          <CreateWalletFromInside
                            onClose={onCloseModal}
                            onBack={() => setActionSelected(null)}
                            onFinish={onFinshCreatingOrImporting}
                          />
                        )}

                        {actionSelected === "import" && (
                          <ImportWalletFromInside
                            onClose={onCloseModal}
                            onBack={() => setActionSelected(null)}
                            onFinish={onFinshCreatingOrImporting}
                          />
                        )}

                        {actionSelected === "detail" && accountData && (
                          <AccountDetails
                            title={`${tAccount("title")}`}
                            onBack={() => setActionSelected(null)}
                            accountData={accountData}
                          />
                        )}
                      </>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};
