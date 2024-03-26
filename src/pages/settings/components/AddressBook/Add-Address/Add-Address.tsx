import { FC, ReactNode, Fragment } from "react";
import { Transition, Dialog } from "@headlessui/react";

interface ModalProps  {
    isOpen : boolean;
    onClose : () => void;
    children : ReactNode;
}

export const Modal: FC<ModalProps> = ({ isOpen, onClose, children }) => {
 
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 backdrop-blur-sm backdrop-filter" />
        </Transition.Child>
        <Transition.Child
          enter="transition-transform ease-out duration-300"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition-transform ease-in duration-200"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <div className="flex justify-center">
          <Dialog.Panel>{children}</Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>)}