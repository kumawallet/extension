import { Fragment, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import {
  useAccountContext,
  useNetworkContext,
} from "@src/providers";
import Account from "@src/storage/entities/Account";
import { Button } from "@src/components/common";
import { GoChevronDown } from "react-icons/go";
import { Wallet } from "./Wallet";
import { CreateWalletFromInside } from "./CreateWalletFromInside";
import { ImportWalletFromInside } from "./ImportWalletFromInside";
import { CgClose } from "react-icons/cg";
import { AccountDetails } from "./AccountDetails";
import { IconWallet } from "@src/components/icons/wallet"

export const AccountList = () => {
  const { t } = useTranslation("balance");
  const { t: tAccount } = useTranslation("account");

  const [isOpen, setIsOpen] = useState(false);

  const [actionSelected, setActionSelected] = useState<'create' | 'import' | 'detail' | null>(null);
  const {
    state: { selectedChain },
  } = useNetworkContext();

  const {
    state: { selectedAccount, accounts },
    setSelectedAccount,
    getAllAccounts
  } = useAccountContext();

  const changeSelectedAccount = (account: Account) => {
    setSelectedAccount(account);
  };
  const [accountData, setAccountData] = useState<Account | null>(null);

  const filteredAccounts = useMemo(() => {
    const acc = accounts?.map((acc) => ({
      ...acc,
    }));

    return acc;
  }, [accounts, selectedChain?.name]);

  const onFinshCreatingOrImporting = () => {
    setActionSelected(null);
    getAllAccounts();
  }


  const onCloseModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setActionSelected(null);
    }, 500)
  }

  return (
    <>
      <button data-testid="account-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center bg-[#212529] gap-1 hover:bg-gray-500 hover:bg-opacity-20 px-2 py-1 rounded-xl">
          <div className="p-1 bg-[#343A40] mr-[0.1rem]  rounded-full">
            <IconWallet size="18" />
          </div>
          <p className="text-primary-default text-base">
            {selectedAccount?.value?.name}
          </p>
          <GoChevronDown size={18} />
        </div>
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => null}>
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
                    {
                      !actionSelected ? (
                        <>

                          <div className="flex items-center justify-between mb-2">
                            <p className="text-base md:text-xl">{t("accounts.accounts")}</p>
                            <button onClick={onCloseModal}>
                              <CgClose size={18} />
                            </button>
                          </div>

                          <div className="flex flex-col gap-5">
                            {filteredAccounts.map((account) => (
                              <Wallet
                                key={account?.key}
                                address={account?.value?.address}
                                name={account?.value?.name}
                                type={account?.type}
                                more={() => {
                                  setAccountData(account);
                                  setActionSelected('detail')
                                }}
                                onSelect={() => changeSelectedAccount(account as Account)}
                                isSelected={account?.key === selectedAccount?.key}
                              />
                            ))}
                          </div>

                          <div className="flex justify-between my-6">
                            <Button
                              classname="!w-[48%] py-3"
                              onClick={() => setActionSelected('create')}
                            >
                              {t("accounts.create")}
                            </Button>
                            <Button
                              classname="!w-[48%] py-3"
                              onClick={() => setActionSelected('import')}
                            >
                              {t("accounts.import")}
                            </Button>
                          </div>

                        </>
                      ) : (
                        <>
                          {
                            actionSelected === 'create' ? (
                              <CreateWalletFromInside
                                onClose={onCloseModal}
                                onBack={() => setActionSelected(null)}
                                onFinish={onFinshCreatingOrImporting}
                              />
                            ) : actionSelected === 'detail' ? (
                              <>
                                {accountData ? (
                                  <AccountDetails
                                    title={`${tAccount("title")}`}
                                    onBack={() => setActionSelected(null)}
                                    accountData={accountData}
                                  />
                                ) : setActionSelected(null)}

                              </>
                            ) :
                              (
                                <>

                                  <ImportWalletFromInside
                                    onClose={onCloseModal}
                                    onBack={() => setActionSelected(null)}
                                    onFinish={onFinshCreatingOrImporting}
                                  />



                                </>

                              )
                          }
                        </>
                      )
                    }


                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>



  );
};
