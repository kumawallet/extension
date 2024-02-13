import { ICON_SIZE } from "@src/constants/icons";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiChevronDown, FiChevronLeft, FiChevronUp } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  PageWrapper,
  Loading,
  Button,
  ReEnterPassword,
} from "@src/components/common";
import { useToast, useLoading } from "@src/hooks";
import { BsEye, BsTrash } from "react-icons/bs";
import { RESTORE_PASSWORD } from "@src/routes/paths";
import { Dialog, Transition } from "@headlessui/react";
import { useAccountContext, useThemeContext } from "@src/providers";
import Account from "@src/storage/entities/Account";
import { messageAPI } from "@src/messageAPI/api";

export const Security = () => {
  const { t } = useTranslation("security");
  const { t: tCommon } = useTranslation("common");
  const { color } = useThemeContext();
  const { getSelectedAccount } = useAccountContext();
  const {
    isLoading: isLoadingReset,
    starLoading: startLoadingReset,
    endLoading: endLoadingReset,
  } = useLoading();
  const [isLoading, setIsLoading] = useState(true);
  const [sites, setSites] = useState([] as string[]);
  const [showSites, setShowSites] = useState(false);
  const [search, setSearch] = useState("" as string);
  const [isOpen, setIsOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [privateKey, setPrivateKey] = useState("" as string);
  const [hideKeys, setHideKeys] = useState(true);
  const [account, setAccount] = useState(
    undefined as Account | null | undefined
  );
  const { showErrorToast } = useToast();
  const navigate = useNavigate();
  const [isOpenReenterPasswordModal, setOpenReenterPasswordModal] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getSites();
    getAccount();
    getPrivateKeyOrSeed();
  }, []);

  const openModal = () => {
    setIsOpen(true);
    setHideKeys(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setHideKeys(true);
  };

  const openResetModal = () => {
    setIsResetOpen(true);
  };

  const closeResetModal = () => {
    setIsResetOpen(false);
  };

  const resetWallet = async () => {
    startLoadingReset();
    try {
      await messageAPI.resetWallet();
      localStorage.removeItem("color");
      window.location.reload();
    } catch (error) {
      showErrorToast(tCommon(error as string));
      endLoadingReset();
    }
  };

  const toggleShowSites = () => {
    setShowSites(!showSites);
  };

  const getAccount = async () => {
    try {
      const account = await getSelectedAccount();
      setAccount(account);
    } catch (error) {
      showErrorToast(tCommon(error as string));
    }
  };

  const getPrivateKeyOrSeed = async (): Promise<void> => {
    try {
      let privateKeyOrSeed: string | undefined = await messageAPI.showKey();
      if (!privateKeyOrSeed) {
        throw new Error("no_private_key_or_seed");
      }
      // For wasm keys, the private key is followed by a slash and the account index
      if (privateKeyOrSeed.includes("/")) {
        const index = privateKeyOrSeed.indexOf("/");
        privateKeyOrSeed = privateKeyOrSeed.substring(0, index);
      }
      setPrivateKey(privateKeyOrSeed);
      setOpenReenterPasswordModal(true)
    } catch (error: unknown) {
      if (typeof error === "string") {
        showErrorToast(tCommon(error));
      }
    }
  };

  const getSites = async () => {
    try {
      const sites = await messageAPI.getTrustedSites();
      setSites(sites);
    } catch (error) {
      setSites([]);
      showErrorToast(tCommon(error as string));
    } finally {
      setIsLoading(false);
    }
  };

  const removeSite = async (site: string) => {
    try {
      await messageAPI.removeTrustedSite({
        site,
      });
      getSites();
    } catch (error) {
      showErrorToast(tCommon(error as string));
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <PageWrapper>
      {isOpenReenterPasswordModal && <ReEnterPassword cb={getPrivateKeyOrSeed} />}


      <div className="flex items-center gap-3 mb-10">
        <FiChevronLeft
          className="cursor-pointer"
          size={ICON_SIZE}
          onClick={() => navigate(-1)}
        />
        <p className="font-medium text-2xl">{t("title")}</p>
      </div>
      <div className="flex flex-col mt-5 gap-2">
        <div className="flex justify-between items-center">
          <p className="text-lg font-medium">{t("trusted_sites")}</p>
          <div className="p-2" data-testid="show-sites">
            {showSites ? (
              <FiChevronUp
                className="cursor-pointer"
                size={ICON_SIZE}
                onClick={toggleShowSites}
              />
            ) : (
              <FiChevronDown
                className="cursor-pointer"
                size={ICON_SIZE}
                onClick={toggleShowSites}
              />
            )}
          </div>
        </div>
        {showSites && (
          <>
            <input
              id="search"
              placeholder={t("search") || "Search"}
              className="input-primary"
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
            {sites
              .filter((site) =>
                site.toLowerCase().includes(search.toLowerCase())
              )
              .map((site, index) => (
                <div
                  className={`flex justify-between items-center hover:bg-${color}-primary hover:bg-opacity-40 rounded-xl px-3 py-3 cursor-pointer gap-2`}
                  key={index}
                >
                  <p className={`text-${color}-primary px-2 break-all w-[75%]`}>
                    {site}
                  </p>
                  <div className="w-[20%] flex justify-end">
                    <BsTrash
                      className="text-lg hover:text-custom-red-bg"
                      onClick={() => removeSite(site)}
                    />
                  </div>
                </div>
              ))}
            {sites.length === 0 && (
              <div className="flex justify-center items-center px-4 py-2">
                <p className="text-sm text-gray-400">{t("no_trusted_sites")}</p>
              </div>
            )}
          </>
        )}
        <div className="flex justify-between items-center">
          <p className="text-lg font-medium">{t("credentials")}</p>
          <div className="p-2">
            <Button
              classname="text-sm font-medium"
              onClick={() => navigate(RESTORE_PASSWORD)}
            >
              {t("restore_password")}
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-lg font-medium">{t("show_account_keys")}</p>
          <div className="p-2">
            <div className="relative inset-0 flex items-center justify-center">
              <Button onClick={() => privateKey ? openModal() : setOpenReenterPasswordModal(true)} classname="text-sm font-medium">
                {tCommon("show")}
              </Button>
            </div>
            <Transition appear show={isOpen} as={Fragment}>
              <Dialog
                as="div"
                className="relative z-10"
                onClose={() => (!isOpen ? closeModal() : false)}
              >
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 scale-95"
                      enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-95"
                    >
                      <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-custom-gray-bg p-6 text-left align-middle shadow-xl transition-all">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-medium leading-6 text-white"
                        >
                          {account?.value.name}
                        </Dialog.Title>
                        <div className="flex flex-col mt-4">
                          <p
                            className={`text-sm text-white text-center break-all rounded-lg border p-2 bg-custom-gray-bg border-${color}-primary`}
                          >
                            {account?.value.address}
                          </p>
                          <div className="relative my-8">
                            <textarea
                              className="text-sm h-[100px] rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white resize-none relative select-none"
                              value={privateKey}
                              aria-readonly={true}
                              readOnly={true}
                              disabled
                              onSelect={(e) => e.preventDefault()}
                              onCopy={(e) => e.preventDefault()}
                            />
                            {hideKeys && (
                              <div className="absolute left-0 top-0 w-full h-full  backdrop-blur-sm bg-black rounded-lg flex justify-center items-center">
                                <button
                                  className="flex flex-col items-center"
                                  onClick={() => setHideKeys(false)}
                                >
                                  <p>{t("show_account_keys")}</p>
                                  <BsEye size={18} />
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-sm font-medium text-custom-red-bg">
                            {t("account_keys_description")}
                          </p>
                          <div className="mt-4 flex justify-end">
                            <Button
                              variant="text"
                              onClick={closeModal}
                              classname="text-sm font-medium"
                            >
                              {tCommon("close")}
                            </Button>
                          </div>
                        </div>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-lg font-medium">{t("reset_wallet")}</p>
          <div className="p-2">
            <div className="relative inset-0 flex items-center justify-center">
              <button
                type="button"
                onClick={() => privateKey ? openResetModal() : setOpenReenterPasswordModal(true)}
                className="inline-flex justify-between items-center cursor-pointer rounded-md border border-transparent hover:bg-custom-red-bg px-4 py-2 text-sm font-medium"
              >
                {t("reset")}
              </button>
            </div>
            <Transition appear show={isResetOpen} as={Fragment}>
              <Dialog
                as="div"
                className="relative z-10"
                onClose={
                  !isLoadingReset && !isResetOpen ? closeResetModal : () => null
                }
              >
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 scale-95"
                      enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-95"
                    >
                      <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-custom-gray-bg p-6 text-left align-middle shadow-xl transition-all">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-medium leading-6 text-white"
                        >
                          {t("reset_wallet")}
                        </Dialog.Title>
                        <div className="flex flex-col mt-4">
                          <p className="text-sm font-medium text-custom-red-bg">
                            {t("reset_wallet_warning")}
                          </p>
                          <div className="mt-4 flex justify-end gap-2">
                            <Button
                              variant="text"
                              onClick={closeResetModal}
                              classname="text-sm font-medium"
                            >
                              {tCommon("close")}
                            </Button>

                            <Button
                              isLoading={isLoadingReset}
                              onClick={resetWallet}
                              classname="inline-flex justify-between items-center cursor-pointer rounded-md border border-custom-red-bg hover:bg-custom-red-bg px-4 py-2 text-sm font-medium"
                            >
                              {t("reset")}
                            </Button>
                          </div>
                        </div>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
