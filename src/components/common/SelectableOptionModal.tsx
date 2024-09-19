import { Fragment, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { RxCross2 } from "react-icons/rx";
import { Loading } from "./Loading";
import { CiSearch } from "react-icons/ci";

interface SelectableOptionModalProps<T> {
  isOpen: boolean;
  items: T[];
  closeModal: () => void;
  title?: JSX.Element | string;
  Item: (props: { item: T }) => JSX.Element;
  isLoading?: boolean;
  emptyMessage?: string;
  filterBy?: string[];
}

export const SelectableOptionModal = <T,>({
  isOpen,
  items,
  closeModal,
  title,
  Item,
  isLoading,
  emptyMessage,
  filterBy
}: SelectableOptionModalProps<T>) => {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const _search = search.toLowerCase().trim();

      if (_search === "") return true;

      if (filterBy) {
        return filterBy.some((key) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const value = (item as any)[key];
          return value.toLowerCase().includes(_search);
        });
      }

    });
  }, [items, search]);

  const handleOnClose = () => {
    setSearch("");
    closeModal();
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleOnClose}>
        <Transition.Child as={Fragment}>
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed bottom-0 left-0 right-0 flex bg-[#333343bb] mx-auto max-w-[357px] pt-6 rounded-t-2xl h-[400px]">
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

              <button className="p-1" onClick={handleOnClose}>
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
                      <>
                        <div className="flex items-center rounded-xl p-2 border border-[#636669] gap-2 bg-[#212529] mb-1">
                          <CiSearch size={16} />
                          <input
                            className="p-2 bg-transparent w-full focus:outline-none focus:border-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search"
                          />
                        </div>

                        <div data-testid="filtered-items-container" className="flex flex-col gap-2">
                          {filteredItems.map((item, index) => (
                            <Item key={index} item={item} />
                          ))}
                        </div>
                      </>
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
