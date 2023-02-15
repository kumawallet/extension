import { FC, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { BsArrowRight } from "react-icons/bs";
import { SiWebassembly, SiEthereum } from "react-icons/si";
import { Chain } from "@src/constants/chains";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { CREATE_ACCOUNT, IMPORT_ACCOUNT } from "@src/routes/paths";

interface ConfirmChainChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  chainToChange: Chain | null;
  needToCreateAccount: boolean;
}

const ICON_COLOR = "#ddda";

export const ConfirmChainChangeModal: FC<ConfirmChainChangeModalProps> = ({
  isOpen,
  needToCreateAccount,
  onClose,
  onConfirm,
  chainToChange,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("balance");
  const changeIsToEVM = chainToChange?.supportedAccounts[0].includes("EVM");

  const chainType = chainToChange?.supportedAccounts[0].toLocaleLowerCase();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-custom-gray-bg text-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 "
                >
                  {t("chain_selector.change_to")} {chainToChange?.name || ""}
                  <span className="capitalize text-gray-300 text-xs block">
                    ( {t(`chain_selector.${chainType}_type`) || ""} )
                  </span>
                </Dialog.Title>

                <div className="flex justify-center gap-3 items-center py-3">
                  {changeIsToEVM ? (
                    <SiWebassembly size={22} color={ICON_COLOR} />
                  ) : (
                    <SiEthereum size={22} color={ICON_COLOR} />
                  )}

                  <BsArrowRight size={20} color={ICON_COLOR} />

                  {changeIsToEVM ? (
                    <SiEthereum size={22} color={ICON_COLOR} />
                  ) : (
                    <SiWebassembly size={22} color={ICON_COLOR} />
                  )}
                </div>

                <div className="my-8">
                  <p className="text-sm">
                    {needToCreateAccount
                      ? t("chain_selector.create_or_import_warning", {
                          type_supported_account: `$t(chain_selector.${chainType}_type)`,
                        })
                      : t("chain_selector.network_change_warning")}
                  </p>
                </div>

                <div className="mt-4 flex justify-end gap-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium  outline-0"
                    onClick={onClose}
                  >
                    {t("chain_selector.cancel")}
                  </button>
                  {!needToCreateAccount ? (
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-custom-green-bg px-4 py-2 text-sm font-medium"
                      onClick={onConfirm}
                    >
                      {t("chain_selector.change")}
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-custom-green-bg px-4 py-2 text-sm font-medium"
                        onClick={() => navigate(IMPORT_ACCOUNT)}
                      >
                        {t("chain_selector.import_account")}
                      </button>
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-custom-green-bg px-4 py-2 text-sm font-medium"
                        onClick={() => navigate(CREATE_ACCOUNT)}
                      >
                        {t("chain_selector.create_account")}
                      </button>
                    </>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
