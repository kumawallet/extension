import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { RxCross2 } from "react-icons/rx";
import { chainSelectorMock } from "@src/mocks/chainSelector-mocks";
import { BsChevronDown } from "react-icons/bs";

export const ChainSelector = () => {
  return (
    <Menu>
      <Menu.Button className="flex gap-2 items-center rounded-full bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
        <p>Polkadot</p>
        <BsChevronDown />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="left-0 absolute origin-top-left top-12 w-full bg-[#29323C] rounded-t-3xl">
          <div className="px-6 py-2 pt-2 text-start">
            <div className="flex justify-end">
              <RxCross2 />
            </div>
            <p className="py-6">polkadot</p>

            <div className="flex flex-col gap-6">
              {chainSelectorMock.map((item, index) => (
                <div key={index.toString()}>
                  <p className="text-[#808385]">{item.type}</p>
                  <div className="flex flex-col gap-1">
                    {item.chains.map((chain) => (
                      <Menu.Item key={chain.name}>
                        {
                          <button className="font-medium text-xl text-start">
                            {chain.name}
                          </button>
                        }
                      </Menu.Item>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
