import { Fragment, useEffect } from "react";
import { Menu, Transition } from "@headlessui/react";
import { BsChevronDown } from "react-icons/bs";
import { useNetworkContext } from "../../providers/NetworkProvider";
import { Chain } from "@src/contants/chains";

export const ChainSelector = () => {
  const {
    state: { chains, selectedChain },
    getSelectedNetwork,
    setSelectNetwork,
  } = useNetworkContext();

  useEffect(() => {
    getSelectedNetwork();
  }, []);

  const changeNetwork = (chain: Chain) => {
    setSelectNetwork(chain);
  };

  return (
    <Menu>
      <Menu.Button className="flex gap-2 items-center rounded-full bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
        <p>{selectedChain?.name}</p>
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
        <Menu.Items className="left-0 absolute origin-top-left max-w-lg top-12 w-full bg-[#29323C] rounded-xl outline-0 z-50">
          <div className="px-6 py-2 pt-2 text-start">
            <div className="flex flex-col gap-1">
              {chains.map((spec) => (
                <>
                  <div className="flex items-center gap-3 whitespace-nowrap">
                    <p className="text-[#808385] text-lg">{spec.name}</p>
                    <div className="h-[1px] w-full bg-[#343A40]" />
                  </div>
                  {spec.chains.map((chain, index) => (
                    <Menu.Item key={index.toString()}>
                      {({ close }) => (
                        <div
                          className="flex gap-2 cursor-pointer items-center hover:bg-custom-green-bg hover:bg-opacity-40 py-2 px-4 rounded-xl"
                          onClick={() => {
                            changeNetwork(chain);

                            close();
                          }}
                        >
                          <div className="w-5 h-5 rounded-full bg-gray-400" />
                          <div className="flex gap-3 items-center">
                            <p className="text-xl">{chain.name}</p>
                            {chain.name === selectedChain?.name && (
                              <p className="text-[#56DF53]">connected</p>
                            )}
                          </div>
                        </div>
                      )}
                    </Menu.Item>
                  ))}
                </>
              ))}
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
