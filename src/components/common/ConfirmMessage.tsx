import { FC, Fragment } from "react";
import { Transition, Dialog } from "@headlessui/react";
import { Button } from "@src/components/common";
import { CgClose } from "react-icons/cg";

interface ConfirmMessageProps {
    isOpen: boolean;
    onClose: () => void;
    messageOne: string;
    messageTwo?: string;
    confirmed: () => void;
}

export const ConfirmMessage: FC<ConfirmMessageProps> = ({
    isOpen,
    onClose,
    messageOne,
    messageTwo,
    confirmed,
}) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="fixed inset-0 z-20
        "
                onClose={onClose}
            >
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
                    <div className="flex justify-center items-center min-h-full text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="relative w-[250px] transform overflow-hidden rounded-2xl bg-[#171720]  p-3 text-left align-middle shadow-xl h-[150px] transition-all flex items-center">
                                <div className="flex flex-col items-center justify-center">
                                    <button onClick={onClose} className="absolute top-2 right-2">
                                        <CgClose size={16} />
                                    </button>
                                    <p className="text-center w-full text-xs mt-3 mb-2">
                                        {messageOne}
                                    </p>
                                    <p className="text-center w-full text-[0.7rem] opacity-80 mb-2">
                                        {messageTwo}
                                    </p>
                                    <div className="flex justify-between mt-2 gap-3 w-full px-4">
                                        <Button
                                            classname="!w-[6rem] py-2 text-[0.7rem] "
                                            onClick={onClose}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            data-testid="confirm-delete-button"
                                            classname="!w-[6rem] py-2 text-[0.7rem]"
                                            onClick={confirmed}
                                        >
                                            Continue
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
