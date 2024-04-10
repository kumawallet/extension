import { Fragment, ReactElement, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useNetworkContext } from "@src/providers";
import { useTranslation } from "react-i18next";
import { ShowTestnets } from "./ShowTestnets";
import { ChainsState } from "@src/types";
import { TfiClose } from "react-icons/tfi";

const canShowTestnetToggle = (
  chains: ChainsState,
  chainGroup: { title: string }
) => {
  const haveCustom = chains.some((chain) => chain.title === "custom");

  if (haveCustom && chainGroup.title === "custom") {
    return true;
  } else if (chainGroup.title === "evm_based") {
    return true;
  }

  return false;
};

export const ChainSelector = () => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] =  useState(false);
  const { t } = useTranslation("balance");
  const {
    state: { chains, selectedChain },
    setSelectNetwork,
  } = useNetworkContext();

  return (
    <>
      { isOpen ? <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" /> : null } 
      <Menu>
        
      
        <Menu.Button
          data-testid="chain-button"
          className="flex bg-[#212529] gap-2 items-center rounded-xl bg-opacity-20 px-2 py-1 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 max-w-[165px] md:max-w-none whitespace-nowrap"
          onClick={() => setIsOpen(true)}
        >
          <img
            src={selectedChain?.logo}
            width={24}
            height={24}
            className="object-cover rounded-full"
          />
          <p className="overflow-hidden text-ellipsis mr-1">
            {selectedChain?.name}
          </p>
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
          <Menu.Items className="left-0 overflow-auto settings-container absolute origin-top-left h-[calc(100vh-108px)] max-w-lg top-10 w-full bg-[#29323C] outline-0 z-50">
          
            <div className=" px-6 py-2 pt-2 text-start">
              
              <div className="relativeflex flex-col gap-1 py-2 mt-2 ">
                <Menu.Button data-testid="chain-button" className="absolute top-6 right-6" onClick={()=>setIsOpen(false)}>
                  <TfiClose  className="font-thin text-[0.7rem]" />
                </Menu.Button>
                <p className="text-base font-light mb-2">Networks</p>
                <p className="text-xs opacity-80 mb-2 font-light">Enable networks you wish to visualize your assets on</p>
                <input
                  type="text"
                  placeholder={t("chain_selector.search") || "Search"}
                  value={search}
                  onChange={({ target }) => setSearch(target.value)}
                  className="w-full bg-[#212529] border-[0.02rem] rounded-lg placeholder:text-white placeholder:font-light placeholder:opacity-80 text-white pl-7 pr-5 py-3"
                />
              </div>
              <div className="flex flex-col gap-4">
                {chains.map((chainGroup) => (
                  <div key={chainGroup.title} className="flex flex-col gap-3">
                    <p className="text-base">{t(chainGroup.title)}</p>
                    <div className="flex flex-col gap-2">
                      {chainGroup.chains.map((chain) => (
                        <Fragment key={chain.id}>
                          <button
                            className={`flex items-center justify-between border ${selectedChain?.id === chain.id
                                ? "border-green-500"
                                : "border-gray-600"
                              } rounded-xl py-2 px-4`}
                            onClick={() => setSelectNetwork(chain)}
                          >
                            <div className="flex items-center gap-3">
                              {chain.isCustom ? (
                                <div className="w-6 h-6 bg-gray-400 flex items-center justify-center rounded-full">
                                  {chain.name[0]}
                                </div>
                              ) : (
                                <img
                                  src={chain.logo}
                                  width={24}
                                  height={24}
                                  alt={chain.name}
                                  className="object-cover rounded-full"
                                />
                              )}
                              <span className="text-xl">{chain.name}</span>
                            </div>
                          </button>
                        </Fragment>
                      ))}
                    </div>

                    {canShowTestnetToggle(chains, chainGroup) && (
                      <ShowTestnets />
                    )}
                  </div>
                ))}
              </div>
            </div>
            </Menu.Items>
            
        </Transition>
      </Menu>
    </>
  );
};
