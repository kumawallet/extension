import { ICON_SIZE } from "@src/constants/icons";
import { FiChevronDown, FiChevronLeft, FiChevronUp } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@src/components/common/PageWrapper";
import { useTranslation } from "react-i18next";
import { Fragment, useEffect, useState } from "react";
import { useToast } from "@src/hooks";
import { Button, InputErrorMessage, Loading } from "@src/components/common";
import Chains, { Chain } from "@src/storage/entities/Chains";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string, number, array } from "yup";
import {
  useAccountContext,
  useNetworkContext,
} from "@src/providers";
import { getAccountType } from "../../utils/account-utils";
import { AccountType } from "@src/accounts/types";
import { CHAINS } from "@src/constants/chains";
import { Listbox, Transition } from "@headlessui/react";
import { captureError } from "@src/utils/error-handling";
import { messageAPI } from "@src/messageAPI/api";

const defaultValues: Chain = {
  name: "New Network",
  rpc: { evm: "", wasm: "" },
  addressPrefix: 0,
  nativeCurrency: {
    name: "",
    symbol: "",
    decimals: 0,
  },
  explorer: {
    evm: {
      name: "evm-explorer",
      url: "",
    },
    wasm: {
      name: "wasm-explorer",
      url: "",
    },
  },
  logo: "",
  supportedAccounts: [AccountType.WASM],
  xcm: [],
};

const schema = object({
  name: string().required(),
  chain: string().optional(),
  addressPrefix: number().optional(),
  rpc: object().shape({
    wasm: string().optional(),
    evm: string().optional(),
  }),
  nativeCurrency: object().shape({
    name: string().required(),
    symbol: string().required(),
    decimals: number().required(),
  }),
  explorer: object().shape({
    evm: object().shape({
      name: string().optional(),
      url: string().optional(),
    }),
    wasm: object().shape({
      name: string().optional(),
      url: string().optional(),
    }),
  }),
  supportedAccounts: array().required(),
}).required();

const SUPPORTED_CHAINS_TYPE = [
  { id: 1, name: "WASM", value: [AccountType.WASM] },
  { id: 2, name: "EVM", value: [AccountType.EVM] },
  { id: 3, name: "WASM & EVM", value: [AccountType.WASM, AccountType.EVM] },
];

export const ManageNetworks = () => {
  const { t } = useTranslation("manage_networks");
  const { t: tCommon } = useTranslation("common");
  const {
    state: { selectedChain },
    refreshNetworks,
    setSelectNetwork,
  } = useNetworkContext();
  const {
    state: { selectedAccount },
    getAllAccounts,
    setSelectedAccount,
  } = useAccountContext();
  const { showErrorToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [networks, setNetworks] = useState({} as Chains);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(
    undefined as Chain | undefined
  );
  const [supportedAccounts, setSupportedAccounts] = useState(
    SUPPORTED_CHAINS_TYPE[0]
  );
  const [showNativeCurrency, setShowNativeCurrency] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getNetworks();
  }, []);

  const getNetworks = async () => {
    try {
      const networks = await messageAPI.getAllChains()
      setNetworks(networks);
      const selectedNetwork = networks.mainnets[0];
      setSelectedNetwork(selectedNetwork);
      setValue("name", selectedNetwork.name);
    } catch (error) {
      captureError(error);
      setNetworks({} as Chains);
      showErrorToast(tCommon(error as string));
    } finally {
      setIsLoading(false);
    }
  };

  const changeNetwork = (chainName: string) => {
    const network = [...networks.mainnets, ...networks.testnets, ...networks.custom]
      .find((network) => network.name === chainName);

    setSelectedNetwork(network);
    reset(network);
  };

  const isCustom = (chainName: string) => {
    return networks.custom.find((network) => network.name === chainName)
      ? true
      : false;
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<Chain>({
    defaultValues,
    resolver: yupResolver(schema),
  });

  const _onSubmit = handleSubmit(async (data) => {
    try {
      await messageAPI.saveCustomChain({
        chain: data
      });
      setIsCreating(false);
      refreshNetworks();
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon(error as string));
    }
  });

  const cancel = () => {
    changeNetwork(networks.mainnets[0].name);
    setIsCreating(false);
  };

  const deleteNetwork = async () => {
    try {
      await messageAPI.removeCustomChain({
        chainName: selectedNetwork?.name as string
      });
      getNetworks();

      const networkIsSelected = selectedChain.name === selectedNetwork?.name;

      if (networkIsSelected) {
        const actualAccountType = getAccountType(
          selectedAccount.type
        ) as AccountType;

        await refreshNetworks();
        setSelectNetwork(CHAINS[0].chains[0]);
        if (actualAccountType !== "WASM") {
          // default to polkadot
          const accounts = await getAllAccounts([AccountType.WASM]);
          await setSelectedAccount(accounts[0]);
        }
      }
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon(error as string));
    }
  };

  const ChainName = watch("name");

  useEffect(() => {
    if (ChainName && networks.mainnets && !isCreating) {
      changeNetwork(ChainName);
    }
  }, [ChainName, networks, isCreating]);

  const showCreateForm = () => {
    setIsCreating(true);
    reset(defaultValues);
  };

  const _supportedAccounts = getValues("supportedAccounts");

  const showAddressPrefix = !isCreating
    ? selectedNetwork?.supportedAccounts.includes(AccountType.WASM)
    : _supportedAccounts.includes(AccountType.WASM);

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center gap-3 mb-10">
          <Loading />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-10">
        <FiChevronLeft
          className="cursor-pointer"
          size={ICON_SIZE}
          onClick={() => navigate(-1)}
        />
        <p className="font-medium text-2xl">{t("title")}</p>
        {!isCreating && (
          <div className="flex-1 flex justify-end">
            <Button classname="text-sm font-medium" onClick={showCreateForm}>
              <span>{t("new_network")}</span>
            </Button>
          </div>
        )}
      </div>

      {isCreating ? (
        <>
          <label htmlFor="name" className="block text-sm font-medium">
            {t("network_name")}
          </label>
          <div className="mt-4">
            <input className="relative input-primary" {...register("name")} />
            <InputErrorMessage message={errors.name?.message} />
          </div>
        </>
      ) : (
        <select
          className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
          {...register("name")}
        >
          {networks &&
            [...networks.mainnets, ...networks.testnets, ...networks.custom].map((network, index) => {
              return (
                <option key={index} value={network.name}>
                  {network.name}
                </option>
              );
            })}
        </select>
      )}

      {isCreating && (
        <div className="mt-4">
          <label
            htmlFor="addressPrefix"
            className="block text-sm font-medium mt-4"
          >
            {t("account_type_support")}
          </label>
          <Listbox
            value={supportedAccounts}
            onChange={(val) => {
              setSupportedAccounts(val);
              setValue("supportedAccounts", val.value);
            }}
          >
            <div className="relative mt-1">
              <Listbox.Button className="text-start relative input-primary">
                <span className="text-start">{supportedAccounts.name}</span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-40">
                  {SUPPORTED_CHAINS_TYPE.map((person, personIdx) => (
                    <Listbox.Option
                      key={personIdx}
                      className="hover:bg-gray-400 hover:bg-opacity-50 cursor-pointer rounded-md overflow-hidden px-1 py-1"
                      value={person}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${selected ? "font-medium" : "font-normal"
                              }`}
                          >
                            {person.name}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                              {/* <CheckIcon className="h-5 w-5" aria-hidden="true" /> */}
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
          <InputErrorMessage message={errors.addressPrefix?.message} />
        </div>
      )}

      {selectedNetwork && (
        <>
          {showAddressPrefix && (
            <>
              <label
                htmlFor="addressPrefix"
                className="block text-sm font-medium mt-4"
              >
                {t("address_prefix")}
              </label>
              <div className="mt-4">
                <input
                  type="number"
                  className="relative mt-4 input-primary"
                  readOnly={!isCustom(selectedNetwork.name) && !isCreating}
                  {...register("addressPrefix")}
                />
                <InputErrorMessage message={errors.addressPrefix?.message} />
              </div>
            </>
          )}

          {selectedNetwork.nativeCurrency && (
            <>
              <div className="flex justify-between items-center mt-2 gap-2">
                <label htmlFor="nativeCurrency" className="text-lg font-medium">
                  {t("native_currency")}
                </label>
                <div className="p-2">
                  {showNativeCurrency ? (
                    <FiChevronUp
                      className="cursor-pointer"
                      size={ICON_SIZE}
                      onClick={() => setShowNativeCurrency(!showNativeCurrency)}
                    />
                  ) : (
                    <FiChevronDown
                      className="cursor-pointer"
                      size={ICON_SIZE}
                      onClick={() => setShowNativeCurrency(!showNativeCurrency)}
                    />
                  )}
                </div>
              </div>
              {showNativeCurrency && (
                <>
                  <div className="mt-5">
                    <div className="text-sm font-medium mb-2">
                      {t("currency_name")}
                    </div>
                    <input
                      className="mt-4 input-primary"
                      readOnly={!isCustom(selectedNetwork.name) && !isCreating}
                      {...register("nativeCurrency.name")}
                    />
                    <InputErrorMessage
                      message={errors.nativeCurrency?.name?.message}
                    />
                  </div>
                  <div className="flex justify-between items-center gap-4 mt-4">
                    <div className="flex flex-col justify-between">
                      <div className="text-sm font-medium mb-2">
                        {t("currency_symbol")}
                      </div>
                      <input
                        className="mt-4 input-primary"
                        readOnly={
                          !isCustom(selectedNetwork.name) && !isCreating
                        }
                        {...register("nativeCurrency.symbol")}
                      />
                      <InputErrorMessage
                        message={errors.nativeCurrency?.symbol?.message}
                      />
                    </div>
                    <div className="flex flex-col justify-between">
                      <div className="text-sm font-medium mb-2">
                        {t("currency_decimals")}
                      </div>
                      <input
                        type="number"
                        className="mt-4 input-primary"
                        readOnly={
                          !isCustom(selectedNetwork.name) && !isCreating
                        }
                        {...register("nativeCurrency.decimals")}
                      />
                      <InputErrorMessage
                        message={errors.nativeCurrency?.decimals?.message}
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {selectedNetwork.rpc && (
            <>
              <label htmlFor="name" className="block text-lg font-medium mt-4">
                {t("rpc_urls")}
              </label>
              {(selectedNetwork.rpc.evm || selectedNetwork.rpc.evm === "") && (
                <div className="mt-5">
                  <input
                    placeholder={t("rpc_evm_placeholder") || ""}
                    className="relative mt-4 input-primary"
                    readOnly={!isCustom(selectedNetwork.name) && !isCreating}
                    {...register("rpc.evm")}
                  />
                </div>
              )}
              {(selectedNetwork.rpc.wasm ||
                selectedNetwork.rpc.wasm === "") && (
                  <div className="mt-5">
                    <input
                      placeholder={t("rpc_wasm_placeholder") || ""}
                      className="relative mt-4 input-primary"
                      readOnly={!isCustom(selectedNetwork.name) && !isCreating}
                      {...register("rpc.wasm")}
                    />
                  </div>
                )}
            </>
          )}

          {selectedNetwork.explorer && (
            <>
              <label htmlFor="name" className="block text-lg font-medium mt-4">
                {t("explorer")}
              </label>
              {selectedNetwork.explorer.evm && (
                <div className="mt-5">
                  <input
                    placeholder={t("explorer_evm_placeholder") || ""}
                    className="relative mt-4 input-primary"
                    readOnly={!isCustom(selectedNetwork.name) && !isCreating}
                    {...register("explorer.evm.url")}
                  />
                </div>
              )}
              {selectedNetwork.explorer.wasm && (
                <div className="mt-5">
                  <input
                    placeholder={t("explorer_wasm_placeholder") || ""}
                    className="relative mt-4 input-primary"
                    readOnly={!isCustom(selectedNetwork.name) && !isCreating}
                    {...register("explorer.wasm.url")}
                  />
                </div>
              )}
            </>
          )}

          {(isCustom(selectedNetwork.name) || isCreating) && (
            <div className="flex justify-end mt-5">
              {!isCreating && (
                <Button
                  variant="text"
                  classname="text-sm"
                  onClick={deleteNetwork}
                >
                  {tCommon("delete")}
                </Button>
              )}
              <Button variant="text" classname="text-sm" onClick={cancel}>
                {tCommon("cancel")}
              </Button>
              <Button classname="text-sm" onClick={_onSubmit}>
                {tCommon("save")}
              </Button>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
};
