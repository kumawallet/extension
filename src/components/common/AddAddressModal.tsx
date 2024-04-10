import { FC, Fragment } from "react";
import { Transition, Dialog } from "@headlessui/react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { IoCloseOutline } from "react-icons/io5";
import { Button, InputErrorMessage } from "@src/components/common";
import { useCopyToClipboard } from "@src/hooks";
import { AddressBookForm } from "@src/types";

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveContact: () => void;
}

export const AddAddressModal: FC<AddAddressModalProps> = ({
  isOpen,
  onClose,
  onSaveContact,
}) => {
  const { t } = useTranslation("adressBook");
  const { t: tCommon } = useTranslation("common");

  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext<AddressBookForm>();

  const checkInput = (event: React.FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget as HTMLInputElement;
    if (input.value !== "") {
      input.classList.add("hasData");
    } else {
      input.classList.remove("hasData");
    }
  };

  const address = watch("address") as string;

  const { Icon, copyToClipboard } = useCopyToClipboard(address);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={() => null}>
        <Transition.Child as={Fragment}>
          <Dialog.Overlay className="fixed inset-0 backdrop-blur-sm backdrop-filter" />
        </Transition.Child>
        <Transition.Child>
          <div className="flex justify-center">
            <Dialog.Panel>
              <div className="fixed bottom-0 left-0 right-0 mx-auto bg-[#333343]/50 rounded-lg p-6 pt-2 max-w-[357px] w-full">
                <div className="w-full flex justify-between items-center mb-5">
                  <p className="text-base">{t("add_new_address")}</p>
                  <button
                    className="absolute text-xl top-2 text-white right-4"
                    onClick={onClose}
                  >
                    <IoCloseOutline />
                  </button>
                </div>
                <div className="relative mb-4 bg-[#1C1C27] h-12 flex items-center">
                  <input
                    data-testid="name"
                    id="name"
                    max={32}
                    min={1}
                    className="input w-full mt-2 relative ml-6"
                    onInput={checkInput}
                    {...register("name")}
                  />
                  <span className="floatingLabel text-base ml-6">
                    {t("insert_name")}
                  </span>
                  <InputErrorMessage message={errors.name?.message} />
                </div>
                <div className="relative mb-4 bg-[#1C1C27] h-12 flex items-center pr-6">
                  <input
                    data-testid="address"
                    id="address"
                    className="input w-full mt-2 relative ml-6"
                    onInput={checkInput}
                    {...register("address")}
                  />
                  <span className="floatingLabel text-base ml-6">
                    {t("insert_address")}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className={`absolute flex items-center justify-center hover:bg-opacity-15 right-4`}
                    data-testid="account-button"
                  >
                    <Icon
                      iconProps={{
                        className: `m-auto text-white `,
                      }}
                    />
                  </button>

                  <InputErrorMessage message={errors.address?.message} />
                </div>
                <Button
                  data-testid="save-button"
                  classname={`text-sm w-full mt-4`}
                  onClick={onSaveContact}
                >
                  {tCommon("save")}
                </Button>
              </div>
            </Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};
