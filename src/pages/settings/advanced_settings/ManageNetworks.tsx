import { ICON_SIZE } from "@src/constants/icons";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@src/components/common/PageWrapper";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useToast } from "@src/hooks";
import { InputErrorMessage, Loading } from "@src/components/common";
import Extension from "@src/Extension";
import Chains, { Chain } from "@src/storage/entities/Chains";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string, number } from "yup";
import { useNetworkContext } from "@src/providers";

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
  supportedAccounts: [],
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
}).required();

export const ManageNetworks = () => {
  const { t } = useTranslation("manage_networks");
  const { t: tCommon } = useTranslation("common");
  const { refreshNetworks } = useNetworkContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [networks, setNetworks] = useState({} as Chains);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(
    undefined as Chain | undefined
  );
  const { showErrorToast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    getNetworks();
  }, []);

  const getNetworks = async () => {
    try {
      const networks = await Extension.getAllChains();
      setNetworks(networks);
      const selectedNetwork = networks.getAll()[0];
      setSelectedNetwork(selectedNetwork);
      setValue("name", selectedNetwork.name);
    } catch (error) {
      setNetworks({} as Chains);
      showErrorToast(tCommon(error as string));
    } finally {
      setIsLoading(false);
    }
  };

  const changeNetwork = (chainName: string) => {
    const network = networks
      .getAll()
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
    formState: { errors },
  } = useForm<Chain>({
    defaultValues,
    resolver: yupResolver(schema),
  });

  const _onSubmit = handleSubmit(async (data) => {
    try {
      await Extension.saveCustomChain(data);
      getNetworks();
      setIsCreating(false);
      refreshNetworks();
    } catch (error) {
      showErrorToast(tCommon(error as string));
    }
  });

  const cancel = () => {
    changeNetwork(networks.mainnets[0].name);
    setIsCreating(false);
  };

  const deleteNetwork = async () => {
    try {
      await Extension.removeCustomChain(selectedNetwork?.name as string);
      getNetworks();
      refreshNetworks(selectedNetwork?.supportedAccounts);
    } catch (error) {
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
            <button
              type="button"
              className="mt-5 inline-flex justify-between items-center rounded-md border border-transparent hover:bg-gray-400 hover:bg-opacity-30 px-4 py-2 text-sm font-medium"
              onClick={showCreateForm}
            >
              <span>{t("new_network")}</span>
            </button>
          </div>
        )}
      </div>

      {isCreating ? (
        <>
          <label htmlFor="name" className="block text-sm font-medium">
            {t("network_name")}
          </label>
          <div className="mt-4">
            <input
              className="relative border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
              {...register("name")}
            />
            <InputErrorMessage message={errors.name?.message} />
          </div>
        </>
      ) : (
        <select
          className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
          {...register("name")}
        >
          {networks &&
            networks?.getAll?.().map((network, index) => {
              return (
                <option key={index} value={network.name}>
                  {network.name}
                </option>
              );
            })}
        </select>
      )}
      {selectedNetwork && (
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
              className="relative mt-4 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
              readOnly={!isCustom(selectedNetwork.name) && !isCreating}
              {...register("addressPrefix")}
            />
            <InputErrorMessage message={errors.addressPrefix?.message} />
          </div>

          {selectedNetwork.nativeCurrency && (
            <>
              <label
                htmlFor="nativeCurrency"
                className="block text-lg font-medium mt-4"
              >
                {t("native_currency")}
              </label>

              <div className="mt-5">
                <div className="text-sm font-medium mb-2">{t("currency_name")}</div>
                <input
                  className="mt-4 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                  readOnly={!isCustom(selectedNetwork.name) && !isCreating}
                  {...register("nativeCurrency.name")}
                />
                <InputErrorMessage
                  message={errors.nativeCurrency?.name?.message}
                />
              </div>

              <div className="mt-5">
                <div className="text-sm font-medium mb-2">{t("currency_symbol")}</div>
                <input
                  className="mt-4 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                  readOnly={!isCustom(selectedNetwork.name) && !isCreating}
                  {...register("nativeCurrency.symbol")}
                />
                <InputErrorMessage
                  message={errors.nativeCurrency?.symbol?.message}
                />
              </div>

              <div className="mt-5">
                <div className="text-sm font-medium mb-2">{t("currency_decimals")}</div>
                <input
                  type="number"
                  className="mt-4 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                  readOnly={!isCustom(selectedNetwork.name) && !isCreating}
                  {...register("nativeCurrency.decimals")}
                />
                <InputErrorMessage
                  message={errors.nativeCurrency?.decimals?.message}
                />
              </div>
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
                    placeholder={t("rpc_evm_placeholder") || ''}
                    className="relative mt-4 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                    readOnly={!isCustom(selectedNetwork.name) && !isCreating}
                    {...register("rpc.evm")}
                  />
                </div>
              )}
              {(selectedNetwork.rpc.wasm ||
                selectedNetwork.rpc.wasm === "") && (
                <div className="mt-5">
                  <input
                    placeholder={t("rpc_wasm_placeholder") || ''}
                    className="relative mt-4 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
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
                    placeholder={t("explorer_evm_placeholder") || ''}
                    className="relative mt-4 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                    readOnly={!isCustom(selectedNetwork.name) && !isCreating}
                    {...register("explorer.evm.url")}
                  />
                </div>
              )}
              {selectedNetwork.explorer.wasm && (
                <div className="mt-5">
                  <input
                    placeholder={t("explorer_wasm_placeholder") || ''}
                    className="relative mt-4 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                    readOnly={!isCustom(selectedNetwork.name) && !isCreating}
                    {...register("explorer.wasm.url")}
                  />
                </div>
              )}
            </>
          )}

          {(isCustom(selectedNetwork.name) || isCreating) && (
            <div className="flex justify-end">
              {!isCreating && (
                <button
                  className="mt-5 inline-flex justify-center border border-custom-gray-bg text-white rounded-lg py-2 px-4 hover:bg-gray-400 hover:bg-opacity-30 transition duration-500 ease select-none focus:outline-none focus:shadow-outline text-sm"
                  onClick={() => deleteNetwork()}
                >
                  {tCommon("delete")}
                </button>
              )}
              <button
                className="mt-5 ml-4 inline-flex justify-center border border-custom-gray-bg text-white rounded-lg py-2 px-4 hover:bg-gray-400 hover:bg-opacity-30 transition duration-500 ease select-none focus:outline-none focus:shadow-outline text-sm"
                onClick={() => cancel()}
              >
                {tCommon("cancel")}
              </button>
              <button
                className="mt-5 ml-4 inline-flex justify-center border border-custom-green-bg text-white rounded-lg py-2 px-4 transition duration-500 ease select-none bg-custom-green-bg focus:outline-none focus:shadow-outline text-sm"
                onClick={_onSubmit}
              >
                {tCommon("save")}
              </button>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
};
