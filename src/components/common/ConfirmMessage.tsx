import { FC, Fragment, useState, useEffect, useRef } from "react";
import { Transition, Dialog } from "@headlessui/react";
import { Button } from "@src/components/common";
import { IoCloseOutline } from "react-icons/io5";
import { InputErrorMessage } from "@src/components/common";
import { useCopyToClipboard } from "@src/hooks";
import { useFormContext } from "react-hook-form";
import { AddressForm } from "@src/types";
import { useTranslation } from "react-i18next";
interface ConfirmMessageProps {
    isOpen: boolean;
    onClose: () => void;
    type: "update" | "delete";
    name: string;
    address: string;
    confirmed: () => void;
}

export const ConfirmMessage: FC<ConfirmMessageProps> = ({
    isOpen,
    onClose,
    name,
    address,
    confirmed,
    type
}) => {
        
    const { t: t } = useTranslation("account");
    const {
        register,
        formState: { errors },
      } = useFormContext<AddressForm>();

  const checkInput = (event: React.FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget as HTMLInputElement;
    if (input.value === "") {
      input.classList.add("hasData");
    } else {
      input.classList.remove("hasData");
    }
  }
  const { Icon, copyToClipboard } = useCopyToClipboard(address);
      const getTitle = () =>{
        return type === "delete" ? "Delete account" : "Update Account"
      }
  
    return (
        
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="fixed inset-0 z-20
        "
                onClose={onClose}
            >
                <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex justify-center items-end min-h-full text-center">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="relative w-full max-w-[357px] transform overflow-hidden rounded-2xl bg-[#171720]  p-3 text-left align-middle shadow-xl h-[250px] transition-all flex justify-center items-center">
                        <div className="fixed bottom-0 left-0 right-0 mx-auto bg-[#333343]/50 rounded-lg p-6 pt-2 max-w-[357px] w-full">
                <div className="w-full flex justify-between items-center mb-5 mt-4">
                  <p className="text-base">{getTitle()}</p>
                  <button
                    className="absolute text-xl top-6 text-white right-5"
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
                    className="inputData w-full mt-2 relative ml-6"
                    disabled={type === "delete"}
                    onInput={checkInput}
                    {...register("name")}
                  />
                  <span className="flotingLabelData text-[11px] ml-6">
                    Name
                  </span>
                  <InputErrorMessage message={errors.name?.message} />
                </div>
                <div className="relative mb-4 bg-[#1C1C27] h-12 flex items-center pr-6">
                  <input
                    data-testid="address"
                    id="address"
                    className="input w-full mt-2 relative ml-6"
                    onInput={checkInput}
                    defaultValue={address}
                    disabled={type === "delete"}
                    {...register("address")}
                  />
                  <span className="flotingLabelData text-[11px] ml-6">
                    Address
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
                                            classname="w-full py-2 text-[0.7rem] "
                                            onClick={onClose}
                                        >
                                           {t("cancel")}
                                            </Button>
                                            <Button
                                            variant="countained-red"
                                            classname="w-full py-2 text-[0.7rem]"
                                            onClick={confirmed}
                                            >
                                            {t("delete")}
                                            </Button>
                                    </div>
              </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
