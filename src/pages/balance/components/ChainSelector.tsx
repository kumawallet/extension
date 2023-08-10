import { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { BsChevronDown } from "react-icons/bs";
import {
  useAccountContext,
  useNetworkContext,
  useThemeContext,

} from "@src/providers";
import { ConfirmChainChangeModal } from "./ConfirmChainChangeModal";
import { useTranslation } from "react-i18next";
import { getAccountType } from "@src/utils/account-utils";
import { useNavigate } from "react-router-dom";
import { CREATE_ACCOUNT } from "@src/routes/paths";
import Extension from "@src/Extension";
import { AccountType } from "@src/accounts/types";
import { Chain } from "@src/storage/entities/Chains";
import { SettingKey, SettingType } from "@src/storage/entities/settings/types";
import { captureError } from "@src/utils/error-handling";

export const ChainSelector = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation("balance");
  const {
    state: { chains, selectedChain },
    setSelectNetwork,
  } = useNetworkContext();
  const {
    state: { selectedAccount },
    getAllAccounts,
    setSelectedAccount,
  } = useAccountContext();
  const { color } = useThemeContext()

  const [chainToChange, setChainToChange] = useState<Chain | null>(null);
  const [openModal, setopenModal] = useState(false);
  const [needToCreateAccount, setNeedToCreateAccount] = useState(false);
  const [showTestnets, setShowTestnets] = useState(false);

  useEffect(() => {
    getSettings();
  }, []);

  const getSettings = async () => {
    try {
      const showTestnets = (
        await Extension.getSetting(
          SettingType.GENERAL,
          SettingKey.SHOW_TESTNETS
        )
      )?.value as boolean;
      setShowTestnets(showTestnets);
    } catch (error) {
      captureError(error);
    }
  };

  const selecteNetwork = async (chain: Chain, close: () => void) => {
    let chainTypeIsSupportedBySelectedAccount = false;
    let thereIsAccountToSupport = false;

    const newChainSupportedTypeAccounts = chain.supportedAccounts;
    const accountType = getAccountType(selectedAccount.type) as AccountType;

    // verify is curreny account support the new chain type
    chainTypeIsSupportedBySelectedAccount =
      newChainSupportedTypeAccounts.includes(accountType);

    if (!chainTypeIsSupportedBySelectedAccount) {
      // verify is any account support the new chain type
      const accounts = await Extension.getAllAccounts(
        newChainSupportedTypeAccounts
      );

      thereIsAccountToSupport = accounts.some((acc) => {
        const accountType = getAccountType(acc.type) as AccountType;
        return newChainSupportedTypeAccounts.includes(accountType);
      });
    }

    if (!thereIsAccountToSupport && !chainTypeIsSupportedBySelectedAccount) {
      setopenModal(true);
      setNeedToCreateAccount(true);
      setChainToChange(chain);
    } else {
      if (chainTypeIsSupportedBySelectedAccount) {
        changeChain(chain);
      } else {
        const accounts = await getAllAccounts(chain.supportedAccounts);
        changeChain(chain);
        await setSelectedAccount(accounts[0], false);
      }
    }

    close?.();
  };

  const changeChain = (chain?: Chain) => {
    setSelectNetwork(chain || (chainToChange as Chain));
    onClose();
  };

  const onClose = () => {
    setopenModal(false);

    setTimeout(() => {
      setChainToChange(null);
      setNeedToCreateAccount(false);
    }, 500);
  };

  const filteredChains = {
    ...chains,
    testnets: showTestnets ? chains.testnets : [],
  };

  return (
    <>
      <Menu>
        <Menu.Button
          data-testid="chain-button"
          className="flex gap-2 items-center rounded-full bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 max-w-[165px] md:max-w-none whitespace-nowrap"
        >
          <img
            src={`/images/${selectedChain.logo}.png`}
            width={24}
            height={24}
            className="object-cover rounded-full"
          />
          <p className="overflow-hidden text-ellipsis">{selectedChain?.name}</p>
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
          <Menu.Items className="left-0 overflow-auto settings-container absolute origin-top-left h-[calc(100vh-99px)] max-w-lg top-12 w-full bg-[#29323C] rounded-xl outline-0 z-50">
            <div className="px-6 py-2 pt-2 text-start">
              <div className="flex flex-col gap-1 py-2">
                <input
                  type="text"
                  placeholder={t("chain_selector.search") || "Search"}
                  value={search}
                  onChange={({ target }) => setSearch(target.value)}
                  className="input-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                {Object.keys(filteredChains).map((spec) => (
                  <div key={spec}>
                    {filteredChains[spec as "mainnets" | "testnets" | "custom"]
                      .length > 0 && (
                        <div className="flex items-center gap-3 whitespace-nowrap">
                          <p className="text-[#808385] text-lg">
                            {t(`chain_selector.${spec}`)}
                          </p>
                          <div className="h-[1px] w-full bg-[#343A40]" />
                        </div>
                      )}
                    {filteredChains[spec as "mainnets" | "testnets" | "custom"]
                      .filter(({ name }) =>
                        name.toLowerCase().includes(search.toLowerCase())
                      )
                      .map((chain, index) => (
                        <Menu.Item key={index.toString()}>
                          {({ close }) => (
                            <div
                              className={`flex gap-2 cursor-pointer items-center hover:bg-${color}-primary hover:bg-opacity-40 py-2 px-4 rounded-xl`}
                              onClick={() => {
                                selecteNetwork(chain, close);
                              }}
                            >
                              <img
                                src={`/images/${chain.logo}.png`}
                                width={30}
                                height={30}
                                alt={chain.name}
                                className="object-cover rounded-full"
                              />
                              {/* <div className="w-5 h-5 rounded-full bg-gray-400" /> */}
                              <div className="flex gap-3 items-center">
                                <p className="text-xl">{chain.name}</p>
                                {chain.name === selectedChain?.name && (
                                  <p className="text-[#56DF53]">
                                    {t("chain_selector.connected")}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </Menu.Item>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
      <ConfirmChainChangeModal
        isOpen={openModal}
        onClose={onClose}
        chainToChange={chainToChange}
        onConfirm={() =>
          needToCreateAccount ? navigate(CREATE_ACCOUNT) : changeChain()
        }
        needToCreateAccount={needToCreateAccount}
      />
    </>
  );
};
