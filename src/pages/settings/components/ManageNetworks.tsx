// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { ICON_SIZE } from "@src/constants/icons";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@src/components/common/PageWrapper";
import { useTranslation } from "react-i18next";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useToast } from "@src/hooks";
import { Button, InputErrorMessage } from "@src/components/common";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string, number } from "yup";
import {
  useAccountContext,
  useNetworkContext,
} from "@src/providers";
import { getAccountType } from "../../../utils/account-utils";
import { AccountType } from "@src/accounts/types";
import { Listbox, Transition } from "@headlessui/react";
import { captureError } from "@src/utils/error-handling";
import { messageAPI } from "@src/messageAPI/api";
import { Chain } from "@src/types";

const defaultValues: Partial<Chain> = {
  id: "",
  name: "",
  rpcs: "",
  prefix: 0,
  symbol: "",
  decimals: 0,
  explorer: "",
  isTestnet: false,
  isCustom: false,
  logo: "",
  type: ""
};

const schema = object({
  name: string().required(),
  prefix: number().optional(),
  rpcs: string().required(),
  symbol: string().required(),
  decimals: number().required(),
  explorer: string().optional(),
}).required();

const SUPPORTED_CHAINS_TYPE = [
  { id: 1, name: "WASM", value: "wasm" },
  { id: 2, name: "EVM", value: "evm" },
];

const isCustomNetwork = (chain: Chain) => {
  return chain.isCustom
}

export const ManageNetworks = () => {
  const { t } = useTranslation("manage_networks");
  const { t: tCommon } = useTranslation("common");
  const {
    state: { selectedChain, chains },
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

  const [isCreating, setIsCreating] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(
    selectedChain
  );
  const [supportedAccounts, setSupportedAccounts] = useState(
    SUPPORTED_CHAINS_TYPE[0]
  );

  const allChains = useMemo(() => {
    return chains.flatMap((chain) => chain.chains);
  }, [chains])

  const changeNetwork = (chainName: string) => {
    const network = allChains.find((chain) => chain.name === chainName);
    setSelectedNetwork(network as Chain);
    reset(network);
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Chain>({
    defaultValues: {
      ...selectedChain,
      rpcs: selectedChain?.rpcs[0],
    } as Chain,
    resolver: yupResolver(schema),
  });

  const _onSubmit = handleSubmit(async (data) => {
    try {
      await messageAPI.saveCustomChain({
        chain: {
          ...data,
          id: `custom-${data.name}`,
          type: supportedAccounts.value,
          isCustom: true,
          isTestnet: false,
          rpcs: [data.rpcs],
        }
      });
      setIsCreating(false);
      refreshNetworks();
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon(error as string));
    }
  });

  const cancel = () => {
    changeNetwork(allChains[0].name);
    setIsCreating(false);
  };

  const deleteNetwork = async () => {
    try {
      await messageAPI.removeCustomChain({
        chainName: selectedNetwork?.name as string
      });
      const networkIsSelected = selectedChain!.name === selectedNetwork?.name;

      if (networkIsSelected) {
        const actualAccountType = getAccountType(
          selectedAccount.type
        ) as AccountType;

        await refreshNetworks();
        setSelectNetwork(chains[0].chains[0]);
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
    if (ChainName && allChains && !isCreating) {
      changeNetwork(ChainName);
    }
  }, [ChainName, allChains, isCreating]);

  const showCreateForm = () => {
    setIsCreating(true);
    reset(defaultValues);
  };

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
          {
            allChains.map((chain, index) => {
              return (
                <option key={index} value={chain.name}>
                  {chain.name}
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
              setValue("type", val.value as "wasm" | "evm");
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
          <InputErrorMessage message={errors.prefix?.message} />
        </div>
      )}

      {selectedNetwork && (
        <>
          {selectedNetwork.type === "wasm" && (
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
                  readOnly={!isCustomNetwork(selectedNetwork) && !isCreating}
                  {...register("prefix")}
                />
                <InputErrorMessage message={errors.prefix?.message} />
              </div>
            </>
          )}

          <div className="flex justify-between items-center gap-4 mt-4">
            <div className="flex flex-col justify-between">
              <div className="text-sm font-medium mb-2">
                {t("currency_symbol")}
              </div>
              <input
                className="mt-4 input-primary"
                readOnly={
                  !isCustomNetwork(selectedNetwork) && !isCreating
                }
                {...register("symbol")}
              />
              <InputErrorMessage
                message={errors?.symbol?.message}
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
                  !isCustomNetwork(selectedNetwork) && !isCreating
                }
                {...register("decimals")}
              />
              <InputErrorMessage
                message={errors?.decimals?.message}
              />
            </div>
          </div>


          {selectedNetwork.rpcs && (
            <>
              <label htmlFor="name" className="block text-lg font-medium mt-4">
                {t("rpc_urls")}
              </label>
              <div className="mt-5">
                <input
                  placeholder={t("rpc_wasm_placeholder") || ""}
                  className="relative mt-4 input-primary"
                  readOnly={!isCustomNetwork(selectedNetwork) && !isCreating}
                  {...register("rpcs")}
                />
              </div>

            </>
          )}

          {selectedNetwork.explorer && (
            <>
              <label htmlFor="name" className="block text-lg font-medium mt-4">
                {t("explorer")}
              </label>
              <div className="mt-5">
                <input
                  placeholder={t("explorer_evm_placeholder") || ""}
                  className="relative mt-4 input-primary"
                  readOnly={!isCustomNetwork(selectedNetwork) && !isCreating}
                  {...register("explorer")}
                />
              </div>
            </>
          )}

          {(isCustomNetwork(selectedNetwork) || isCreating) && (
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
