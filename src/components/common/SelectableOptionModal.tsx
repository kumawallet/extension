import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { RxCross2 } from "react-icons/rx";
import { Loading } from "./Loading";

interface SelectableOptionModalProps<T> {
  isOpen: boolean;
  items: T[];
  closeModal: () => void;
  title?: JSX.Element | string;
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

        <div className="fixed bottom-0 left-0 right-0 flex bg-[#333343bb] pt-6 rounded-t-2xl h-3/5">
          <Dialog.Panel className="w-full">
            <div
              className={`flex items-center  px-6 mb-3 ${title ? "justify-between" : "justify-end"
                }`}
            >
              {typeof title === "string" ? (
                <p className="text-base">{title}</p>
              ) : (
                title
              )}

              <button className="p-1" onClick={closeModal}>
                <RxCross2 size={18} />
              </button>
            </div>

            <div className="overflow-y-scroll h-[90%] py-3">
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
                      <div className="flex flex-col gap-2">
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
        </div>
      </Dialog>
    </Transition>
  );
};
