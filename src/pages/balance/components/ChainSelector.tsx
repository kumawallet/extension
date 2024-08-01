import { Fragment, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useNetworkContext } from "@src/providers";
import { useTranslation } from "react-i18next";
import { ShowTestnets } from "./ShowTestnets";
import { ChainType, ChainsState } from "@src/types";
import { TfiClose } from "react-icons/tfi";
import { CiSearch } from "react-icons/ci";
import { Network } from "../../../components/icons/Network";
import { messageAPI } from "@src/messageAPI/api";
import { ChainOption } from "./ChainOption";
import { ChainStatus } from "@src/storage/entities/Provider";

const canShowTestnetToggle = (
  chains: ChainsState,
  chainGroup: { title: string }
) => {
  const haveCustom = chains.some((chain) => chain.title === "custom");

  if (haveCustom && chainGroup.title === "custom") {
    return true;
  } else if (chainGroup.title === "move") {
    return true;
  }

  return false;
};

export const ChainSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { t } = useTranslation("balance");
  const {
    state: { chains, selectedChain, chainStatus },
  } = useNetworkContext();

  const updateSelectNetwork = async (
    id: string,
    type: ChainType,
    isTestnet?: boolean
  ) => {
    if (Object.keys(selectedChain).includes(id)) {
      await messageAPI.deleteSelectChain({ id });
    } else await messageAPI.setNetwork({ id, isTestnet, type });
  };

  const validateTestnet = () => {
    const selected = Object.keys(selectedChain).filter(
      (chain) => selectedChain[chain].isTestnet
    );
    if (selected.length > 0) {
      return true;
    } else {
      return false;
    }
  };

  const filteredChains = useMemo(() => {
    if (!search.trim()) return chains;

    return chains.map((chain) => {
      const chainGroup = chain.chains.filter((chain) =>
        chain.name.toLowerCase().includes(search.toLowerCase().trim())
      );

      return {
        title: chain.title,
        chains: chainGroup,
      };
    });
  }, [search, chains]);

  return (
    <>
      <button
        data-testid="chain-button"
        className="flex bg-[#212529] gap-1 items-center rounded-xl  px-2 py-1 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 max-w-[165px] md:max-w-none whitespace-nowrap"
        onClick={() => setIsOpen(true)}
      >
        <Network size="22" className="my-[0.15rem]" />
        <p className="overflow-hidden text-ellipsis mr-1">
          {t("chain_selector.title")}
        </p>
      </button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsOpen(false)}
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
            <div className="flex justify-center min-h-full text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-[357px] transform overflow-hidden rounded-b-2xl bg-[#2C3137]  px-8 py-4 text-left align-middle shadow-xl h-fit transition-all mt-[2.7rem]">
                  <div className=" py-2 pt-2 text-start ">
                    <div className="flex flex-col gap-1 py-2 mt-2 ">
                      <button
                        data-testid="chain-button"
                        className="absolute top-6 right-6"
                        onClick={() => setIsOpen(false)}
                      >
                        <TfiClose className="font-thin text-[0.7rem]" />
                      </button>
                      <p className="text-base font-light mb-2">
                        {t("chain_selector.title")}
                      </p>
                      <p className="text-xs opacity-80 mb-2 font-light">
                        {t("chain_selector.description")}
                      </p>
                      <div className="relative">
                        <input
                          data-testid="search-input"
                          type="text"
                          placeholder={t("chain_selector.search") || "Search"}
                          value={search}
                          onChange={({ target }) => setSearch(target.value)}
                          className="w-full bg-[#212529] border-[0.02rem] border-gray-300 rounded-lg placeholder:text-white placeholder:font-light placeholder:opacity-80 text-white pl-8 pr-5 py-3"
                        />
                        <CiSearch className="absolute text-base top-1/2 left-3 transform font-mediums -translate-y-1/2 text-white" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-4 mt-4">
                      {filteredChains.map((chainGroup) => (
                        <div
                          key={chainGroup.title}
                          className="flex flex-col gap-3 relative"
                        >
                          {chainGroup.chains.length > 0 && (
                            <p className="text-base">{t(chainGroup.title)}</p>
                          )}
                          <div
                            data-testid="chains-container"
                            className="flex flex-col gap-3"
                          >
                            {chainGroup.chains.map((chain) => (
                              (<ChainOption
                                key={chain.id}
                                chain={chain}
                                status={chainStatus[chain.id] as ChainStatus}
                                isSelected={Boolean(selectedChain[chain.id])}
                                isDisabled={
                                  Object.keys(selectedChain).length === 1 &&
                                  Object.keys(selectedChain)[0] === chain.id
                                }
                                onClick={() =>
                                  updateSelectNetwork(
                                    chain.id,
                                    chain.type,
                                    chain.isTestnet
                                  )
                                }
                              />)
                            ))}
                          </div>

                          {canShowTestnetToggle(chains, chainGroup) && (
                            <ShowTestnets validateSwitch={validateTestnet()} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
