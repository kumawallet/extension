import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { RxCross2 } from "react-icons/rx";
import { Loading } from "./Loading";

interface SelectableOptionModalProps<T> {
  isOpen: boolean;
  items: T[];
  closeModal: () => void;
  title?: JSX.Element;
  Item: (props: { item: T }) => JSX.Element;
  isLoading?: boolean;
  emptyMessage?: string;
}

export const SelectableOptionModal = <T,>({
  isOpen,
  items,
  closeModal,
  title,
  Item,
  isLoading,
  emptyMessage,
}: SelectableOptionModalProps<T>) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => null}>
        <Transition.Child as={Fragment}>
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed bottom-0 left-0 right-0 overflow-y-auto bg-[#333343] pt-6 rounded-t-2xl h-3/5">
          <div className="flex items-center justify-center text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full">
                <div
                  className={`flex ${title ? "justify-between" : "justify-end"
                    } px-6 mb-6`}
                >
                  {title}
                  <button className="p-1" onClick={closeModal}>
                    <RxCross2 size={18} />
                  </button>
                </div>

                <div className="overflow-y-scroll">
                  <div className="flex flex-col gap-2 px-5">
                    {isLoading ? (
                      <Loading />
                    ) : (
                      <>
                        {items.length === 0 ? (
                          <div className="text-center">
                            <span>{emptyMessage}</span>
                          </div>
                        ) : (
                          <div>
                            {items.map((item, index) => (
                              <Item key={index} item={item} />
                            ))}
                          </div>
                        )}
                      </>
                    )}
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
