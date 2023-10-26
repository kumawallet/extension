import { FC, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { Button } from "@src/components/common";

interface ConfirmDialogProps {
  isOpen: boolean;
  closeModal: () => void;
  isLoading: boolean;
  fee: string;
  description: string;
  onAccept: () => void;
}

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  isOpen,
  closeModal,
  isLoading,
  fee,
  description,
  onAccept,
}) => {
  const { t } = useTranslation();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => null}
      >
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-custom-gray-bg p-6 text-left align-middle shadow-xl transition-all z-50">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 mb-1"
                >
                  {t("confirm_action")}
                </Dialog.Title>

                <div className="text-sm mb-4">
                  <p>{description}</p>

                  <div className="flex justify-between p-2">
                    <p>{t("fee")}:</p>
                    <p>{fee}</p>
                  </div>
                </div>

                <div className="flex gap-4 justify-end mt-5 items-center">
                  <Button
                    isLoading={isLoading}
                    variant="text"
                    classname="text-sm"
                    onClick={closeModal}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    isLoading={isLoading}
                    classname="text-sm"
                    onClick={onAccept}
                  >
                    {t("confirm")}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
