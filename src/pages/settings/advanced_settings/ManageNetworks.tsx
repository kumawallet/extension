import { ICON_SIZE } from "@src/constants/icons";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@src/components/common/PageWrapper";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useToast } from "@src/hooks";
import { Loading } from "@src/components/common";
import Extension from "@src/Extension";
import Chains, { Chain } from "@src/storage/entities/Chains";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string, number } from "yup";

export const ManageNetworks = () => {
  const { t } = useTranslation("manage_networks");
  const { t: tCommon } = useTranslation("common");
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
      setSelectedNetwork(networks.getAll()[0]);
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
    setValue("name", network?.name || "");
    setValue("addressPrefix", network?.addressPrefix);
    setValue("explorer", network?.explorer || {});
    setValue("logo", network?.logo || "");
    setValue(
      "nativeCurrency",
      network?.nativeCurrency || { name: "", symbol: "", decimals: 0 }
    );
    setValue("rpc", network?.rpc || { evm: "", wasm: "" });
  };

  const isCustom = (chainName: string) => {
    return networks.custom.find((network) => network.name === chainName)
      ? true
      : false;
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
      name: string().required(),
      url: string().required(),
    }),
  }).required();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Chain>({
    defaultValues: {
      name: "New Network",
      rpc: { evm: "", wasm: "" },
      addressPrefix: 0,
      nativeCurrency: {
        name: "",
        symbol: "",
        decimals: 0,
      },
      explorer: {},
    },
    resolver: yupResolver(schema),
  });

  const _onSubmit = handleSubmit(async (data) => {
    try {
      await Extension.saveCustomChain(data);
      getNetworks();
      setIsCreating(false);
    } catch (error) {
      showErrorToast(tCommon(error as string));
    }
  });

  const cancel = () => {
    changeNetwork(networks.mainnets[0].name);
    setIsCreating(false);
  };

  const deleteNetwork = async (chainName: string) => {
    try {
      await Extension.removeCustomChain(chainName);
      getNetworks();
    } catch (error) {
      showErrorToast(tCommon(error as string));
    }
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
              onClick={() => setIsCreating(true)}
            >
              <span>{"New network"}</span>
            </button>
          </div>
        )}
      </div>

      {isCreating ? (
        <>
          <label htmlFor="name" className="block text-sm font-medium">
            {"Name"}
          </label>
          <div className="mt-4">
            <input
              className="relative border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
              {...register("name")}
            />
          </div>
        </>
      ) : (
        <select
          className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
          {...register("name")}
        >
          {networks &&
            networks.getAll().map((network, index) => {
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
            {"Address Prefix"}
          </label>
          <div className="mt-4">
            <input
              type="number"
              className="relative mt-4 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
              readOnly={!isCustom(selectedNetwork.name) && !isCreating}
              {...register("addressPrefix")}
            />
          </div>

          {selectedNetwork.nativeCurrency && (
            <>
              <label
                htmlFor="nativeCurrency"
                className="block text-lg font-medium mt-4"
              >
                {"Native currency"}
              </label>
              {selectedNetwork.nativeCurrency.name && (
                <div className="mt-5">
                  <div className="text-sm font-medium mb-2">{"Name"}</div>
                  <input
                    className="mt-4 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                    readOnly={!isCustom(selectedNetwork.name) && !isCreating}
                    {...register("nativeCurrency.name")}
                  />
                </div>
              )}
              {selectedNetwork.nativeCurrency.symbol && (
                <div className="mt-5">
                  <div className="text-sm font-medium mb-2">{"Symbol"}</div>
                  <input
                    className="mt-4 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                    readOnly={!isCustom(selectedNetwork.name) && !isCreating}
                    {...register("nativeCurrency.symbol")}
                  />
                </div>
              )}
              {selectedNetwork.nativeCurrency.decimals && (
                <div className="mt-5">
                  <div className="text-sm font-medium mb-2">{"Name"}</div>
                  <input
                    type="number"
                    className="mt-4 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                    readOnly={!isCustom(selectedNetwork.name) && !isCreating}
                    {...register("nativeCurrency.decimals")}
                  />
                </div>
              )}
            </>
          )}

          {selectedNetwork.rpc && (
            <>
              <label htmlFor="name" className="block text-lg font-medium mt-4">
                {"RPC URLs"}
              </label>
              {selectedNetwork.rpc.evm && (
                <div className="mt-5">
                  <input
                    placeholder={"EVM RPC URL"}
                    className="relative mt-4 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                    readOnly={!isCustom(selectedNetwork.name) && !isCreating}
                    {...register("rpc.evm")}
                  />
                </div>
              )}
              {selectedNetwork.rpc.wasm && (
                <div className="mt-5">
                  <input
                    placeholder={"WASM RPC URL"}
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
                {"Explorer"}
              </label>
              {selectedNetwork.explorer.evm && (
                <div className="mt-5">
                  <input
                    placeholder="EVM Explorer URL"
                    className="relative mt-4 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                    readOnly={!isCustom(selectedNetwork.name) && !isCreating}
                    {...register("explorer.evm.url")}
                  />
                </div>
              )}
              {selectedNetwork.explorer.wasm && (
                <div className="mt-5">
                  <input
                    placeholder="WASM Explorer URL"
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
              <button
                className="mt-5 bg-custom-green-bg hover:bg-custom-green-hover text-white font-medium py-2 px-4 rounded-lg"
                onClick={_onSubmit}
              >
                {"Save"}
              </button>
              <button
                className="mt-5 ml-4 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg"
                onClick={() => cancel()}
              >
                {"Cancel"}
              </button>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
};
