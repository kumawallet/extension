import { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useNetworkContext } from "@src/providers";
import { useTranslation } from "react-i18next";
import { ShowTestnets } from "./ShowTestnets";
import { ChainType, ChainsState } from "@src/types";
import { TfiClose } from "react-icons/tfi";
import { CiSearch } from "react-icons/ci";
import { Network } from "../../../components/icons/Network";
import { messageAPI } from "@src/messageAPI/api";
import { Switch } from "@headlessui/react";

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
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation("balance");
  const {
    state: { chains, selectedChain },
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
  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 bg-black/25 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      ) : null}
      <Menu>
        <Menu.Button
          data-testid="chain-button"
          className="flex bg-[#212529] gap-1 items-center rounded-xl  px-2 py-1 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 max-w-[165px] md:max-w-none whitespace-nowrap"
          onClick={() => setIsOpen(true)}
        >
          <Network size="22" className="my-[0.15rem]" />
          <p className="overflow-hidden text-ellipsis mr-1">
            {t("chain_selector.title")}
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
          <Menu.Items className="left-0 overflow-auto settings-container absolute origin-top-left h-[calc(100vh-2.5rem)] max-w-lg top-10 w-full bg-[#2C3137] outline-0 z-50">
            <div className=" px-8 py-2 pt-2 text-start">
              <div className="relativeflex flex-col gap-1 py-2 mt-2 ">
                <Menu.Button
                  data-testid="chain-button"
                  className="absolute top-6 right-6"
                  onClick={() => setIsOpen(false)}
                >
                  <TfiClose className="font-thin text-[0.7rem]" />
                </Menu.Button>
                <p className="text-base font-light mb-2">
                  {t("chain_selector.title")}
                </p>
                <p className="text-xs opacity-80 mb-2 font-light">
                  {t("chain_selector.description")}
                </p>
                <div className="relative">
                  <input
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
                {chains.map((chainGroup) => (
                  <div key={chainGroup.title} className="flex flex-col gap-3">
                    <p className="text-base">{t(chainGroup.title)}</p>
                    <div className="flex flex-col gap-3">
                      {chainGroup.chains.map((chain) => (
                        <Fragment key={chain.id}>
                          <button
                            className={`flex items-center justify-between border ${selectedChain[chain.id]
                                ? "border-green-500"
                                : "border-gray-600"
                              } rounded-lg py-3 px-4`}
                            disabled={
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
                          >
                            <div className="flex items-center gap-3">
                              {chain.isCustom ? (
                                <div className="w-6 h-6 bg-gray-400 flex items-center justify-center text-base rounded-full">
                                  {chain.name[0]}
                                </div>
                              ) : (
                                <img
                                  src={chain.logo}
                                  width={18}
                                  height={18}
                                  alt={chain.name}
                                  className="object-cover rounded-full"
                                />
                              )}
                              <span className="text-base">{chain.name}</span>
                            </div>
                            <div className="flex items-center">
                              <Switch
                                checked={
                                  Object.prototype.hasOwnProperty.call(
                                    selectedChain,
                                    chain.id
                                  )
                                    ? true
                                    : false
                                }
                                className={`${Object.prototype.hasOwnProperty.call(
                                  selectedChain,
                                  chain.id
                                )
                                    ? `bg-green-500`
                                    : "bg-custom-gray-bg"
                                  } relative inline-flex items-center h-2 rounded-full w-7 transition-colors duration-200`}
                              >
                                <span
                                  className={`${Object.prototype.hasOwnProperty.call(
                                    selectedChain,
                                    chain.id
                                  ) && "translate-x-4"
                                    } inline-block w-3 h-3 transform bg-white rounded-full transition-transform duration-200`}
                                />
                              </Switch>
                            </div>
                          </button>
                        </Fragment>
                      ))}
                    </div>

                    {canShowTestnetToggle(chains, chainGroup) && (
                      <ShowTestnets validateSwitch={validateTestnet()} />
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
