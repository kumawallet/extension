import { FC, Fragment} from "react";
import { Transition, Dialog } from "@headlessui/react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { IoCloseOutline } from "react-icons/io5";
import { Button, InputErrorMessage } from "@src/components/common";
import { useCopyToClipboard } from "@src/hooks";
import { AddressForm } from "@src/types";

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "create" | "update";
  onSaveContact?: () => void;
  onUpdateContact?: () => void;
  onDeleteContact?: () => void; 

}

export const AddAddressModal: FC<AddAddressModalProps> = ({
  isOpen,
  onClose,
  onSaveContact,
  type,
  onDeleteContact,
  onUpdateContact
}) => {
  const { t } = useTranslation("address_book");
  const { t: tCommon } = useTranslation("common");

  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext<AddressForm>();
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

  const getTitle = () => {
    return type === "create" ? t("add_new_address") : t("update_contact");
  }

  const saveOrUpdate = () => {
    type === "create" ? onSaveContact?.() : onUpdateContact?.();
  } 

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={ onClose}>
        <Transition.Child as={Fragment}>
          <Dialog.Overlay className="fixed inset-0 backdrop-blur-sm backdrop-filter" />
        </Transition.Child>
        <Transition.Child>
          <div className="flex justify-center">
            <Dialog.Panel>
              <div className="fixed bottom-0 left-0 right-0 mx-auto bg-[#333343]/50 rounded-lg p-6 pt-2 max-w-[357px] w-full">
                <div className="w-full flex justify-between items-center mb-5">
                  <p className="text-base">{getTitle()}</p>
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
                    className={`input  w-full mt-2 relative ml-6 ${type === "create" ? "" : "hasData"}`}
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
                    className={`input  w-full mt-2 relative ml-6 ${type === "create" ? "" : "hasData"}`}
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
                <div className="flex justify-between mt-2 gap-1 w-full ">
                    <Button
                      data-testid="save-button"
                      classname={`text-sm py-1 w-full mt-4`}
                      onClick={saveOrUpdate}
                    >
                      {tCommon("save")}
                    </Button>
                    <Button
                          data-testid="confirm-delete-button"
                          variant="countained-red"
                          classname={`w-full py-1 text-sm  mt-4 ${type ==="create" ? "hidden" : "block"}`}
                          onClick={onDeleteContact}
                        >
                          {t("delete")}
                    </Button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};
