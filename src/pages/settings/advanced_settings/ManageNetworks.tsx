import { ICON_SIZE } from "@src/constants/icons";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@src/components/common/PageWrapper";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useToast } from "@src/hooks";
import { Loading } from "@src/components/common";
import Extension from "@src/Extension";
import Chains from "@src/storage/entities/Chains";
import { Chain } from "@src/constants/chains";
import { BsPlus } from "react-icons/bs";

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
  };

  const isCustom = (chainName: string) => {
    return networks.custom.find((network) => network.name === chainName)
      ? true
      : false;
  };

  const updateName = (value: string) => {
    if (!selectedNetwork) return;
    const newSelectedNetwork = { ...selectedNetwork };
    newSelectedNetwork.name = value;
    setSelectedNetwork(newSelectedNetwork);
  };

  const updateExplorer = async (newExplorer: string, index: number) => {
    if (!selectedNetwork) return;
    const newSelectedNetwork = { ...selectedNetwork };
    if (!newSelectedNetwork.explorers) {
      newSelectedNetwork.explorers = [{ url: "", name: "explorer" }];
    }
    newSelectedNetwork.explorers[index].url = newExplorer;
    setSelectedNetwork(newSelectedNetwork as Chain);
  };

  const updateNativeCurrency = async (key: string, value: string) => {
    if (!selectedNetwork) return;
    const newSelectedNetwork = { ...selectedNetwork };
    if (!newSelectedNetwork.nativeCurrency) {
      newSelectedNetwork.nativeCurrency = {
        name: "",
        symbol: "",
        decimals: 0,
      };
    }
    newSelectedNetwork.nativeCurrency[key] =
      key === "decimals" ? parseInt(value) : value;
    setSelectedNetwork(newSelectedNetwork as Chain);
  };

  const updateAddressPrefix = async (value: string) => {
    if (!selectedNetwork) return;
    const newSelectedNetwork = { ...selectedNetwork };
    if (!newSelectedNetwork.addressPrefix) {
      newSelectedNetwork.addressPrefix = 0;
    }
    newSelectedNetwork.addressPrefix = parseInt(value);
    setSelectedNetwork(newSelectedNetwork as Chain);
  };

  const updateChain = async (value: string) => {
    if (!selectedNetwork) return;
    const newSelectedNetwork = { ...selectedNetwork };
    if (!newSelectedNetwork.chain) {
      newSelectedNetwork.chain = "";
    }
    newSelectedNetwork.chain = value;
    setSelectedNetwork(newSelectedNetwork as Chain);
  };

  const updateRPC = async (key: string, value: string) => {
    if (!selectedNetwork) return;
    const newSelectedNetwork = { ...selectedNetwork };
    if (!newSelectedNetwork.rpc) {
      newSelectedNetwork.rpc = { evm: "", wasm: "" };
    }
    newSelectedNetwork.rpc[key] = value;
    setSelectedNetwork(newSelectedNetwork as Chain);
  };

  const saveNetwork = async () => {
    if (!selectedNetwork) return;
    try {
      await Extension.saveCustomChain(selectedNetwork);
      getNetworks();
      setIsCreating(false);
    } catch (error) {
      showErrorToast(tCommon(error as string));
    }
  };

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

  const newNetwork = async () => {
    setIsCreating(true);
    const newCustomNetwork: Chain = {
      name: "New Network",
      chain: "",
      rpc: { evm: "", wasm: "" },
      addressPrefix: 0,
      nativeCurrency: {
        name: "",
        symbol: "",
        decimals: 0,
      },
      explorers: [{ url: "", name: "explorer" }],
    } as Chain;
    setSelectedNetwork(newCustomNetwork);
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
              onClick={() => newNetwork()}
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
              type="text"
              name="name"
              id="name"
              value={selectedNetwork?.name}
              onChange={(e) => updateName(e.target.value)}
            />
          </div>
        </>
      ) : (
        <select
          className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
          value={selectedNetwork?.name}
          onChange={(e) => changeNetwork(e.target.value)}
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
          <label htmlFor="name" className="block text-sm font-medium mt-4">
            {"Chain"}
          </label>
          <div className="mt-4">
            <input
              className="relative mt-4 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
              value={selectedNetwork.chain}
              onChange={(e) => updateChain(e.target.value)}
              readOnly={!isCustom(selectedNetwork.name) && !isCreating}
            />
          </div>
          <label htmlFor="name" className="block text-sm font-medium mt-4">
            {"Address Prefix"}
          </label>
          <div className="mt-4">
            <input
              type="number"
              className="relative mt-4 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
              value={selectedNetwork.addressPrefix}
              onChange={(e) => updateAddressPrefix(e.target.value)}
              readOnly={!isCustom(selectedNetwork.name) && !isCreating}
            />
          </div>

          {selectedNetwork.nativeCurrency && (
            <>
              <label htmlFor="name" className="block text-lg font-medium mt-4">
                {"Native currency"}
              </label>
              {Object.keys(selectedNetwork.nativeCurrency).map((key, index) => {
                const value = selectedNetwork.nativeCurrency[key];
                return (
                  <div key={index} className="mt-5">
                    <div className="text-sm font-medium mb-2 capitalize">
                      {key}
                    </div>
                    <input
                      key={index}
                      placeholder={key}
                      type={key === "decimals" ? "number" : "text"}
                      className="mt-4 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                      value={value}
                      onChange={(e) =>
                        updateNativeCurrency(key, e.target.value)
                      }
                      readOnly={!isCustom(selectedNetwork.name) && !isCreating}
                    />
                  </div>
                );
              })}
            </>
          )}

          {selectedNetwork.rpc && (
            <>
              <label htmlFor="name" className="block text-lg font-medium mt-4">
                {"RPC URLs"}
              </label>
              {Object.keys(selectedNetwork.rpc).map((key, index) => {
                const rpc = selectedNetwork.rpc[key];
                return (
                  <div key={index} className="mt-5">
                    <input
                      placeholder={key}
                      className="relative mt-4 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                      value={rpc}
                      onChange={(e) => updateRPC(key, e.target.value)}
                      readOnly={!isCustom(selectedNetwork.name) && !isCreating}
                    />
                  </div>
                );
              })}
            </>
          )}

          {selectedNetwork.explorers && (
            <>
              <label htmlFor="name" className="block text-lg font-medium mt-4">
                {"Explorer"}
              </label>
              {selectedNetwork.explorers.map((key, index) => {
                return (
                  <div key={index} className="mt-5">
                    <input
                      className="relative mt-4 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                      value={key.url}
                      onChange={(e) => updateExplorer(e.target.value, index)}
                      readOnly={!isCustom(selectedNetwork.name) && !isCreating}
                    />
                  </div>
                );
              })}
            </>
          )}

          {(isCustom(selectedNetwork.name) || isCreating) && (
            <div className="flex justify-end">
              <button
                className="mt-5 bg-custom-green-bg hover:bg-custom-green-hover text-white font-medium py-2 px-4 rounded-lg"
                onClick={() => saveNetwork()}
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
