import { Fragment, useEffect, useMemo, useState } from "react";
import { Button, ShowCollection } from "@src/components/common";
// import { useTranslation } from "react-i18next";
import { useToast } from "@src/hooks";
import { useNFTContext } from "@src/providers/nftProvider";
import { IoAdd } from "react-icons/io5";
import { Dialog, Transition } from "@headlessui/react";
import { TfiClose } from "react-icons/tfi";
import { SelectableAssetBuy } from "@src/pages/buy/components/SelectableAsset";
import { useAccountContext, useNetworkContext } from "@src/providers";
import { messageAPI } from "@src/messageAPI/api";
import { CiSearch } from "react-icons/ci";
import { getType } from "@src/utils/assets";
import { Chain } from "@src/pages/buy/types";
import { ChainType, NFTContract, NFTInfo } from "@src/types";
import { captureError } from "@src/utils/error-handling";

export const NFT = () => {
  const initValidated: NFTInfo = {
    contractAddress: "",
    collectionName: "",
    collectionSymbol: "",
    isValidated: true,
  };
  const { showSuccessToast, showErrorToast } = useToast();
  const {
    state: { selectedChain, chains },
  } = useNetworkContext();
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState<any>();
  const [validated, setValidated] = useState<boolean>(true);
  const [dataInfo, setDataInfo] = useState<NFTInfo>(initValidated);
  const {
    state: { nfts },
  } = useNFTContext();
  const {
    state: { selectedAccount, accounts },
  } = useAccountContext();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<string | undefined>(
    selectedAccount?.value?.address || accounts[0].value?.address
  );
  const [inputName, setinputName] = useState<string>("");
  const [inputSymbol, setinputSymbol] = useState<string>("");

  const handlerClearInput = () => {
    setSelectedAddress(
      selectedAccount?.value?.address || accounts[0].value?.address
    );
    setInput("");
    setinputName("");
    setinputSymbol("");
    setIsOpen(false);
    setValidated(true);
    setDataInfo(initValidated);
  };
  const handlerValidationModal = () => {
    if (
      selectedAccount?.value &&
      getType(selectedAccount.type.toLowerCase()) === ChainType.OL
    ) {
      showErrorToast("functionality not available for this account type");
      return;
    }
    setIsOpen(true);
  };

  const handlerInput = async (event?: any) => {
    try {
      if (event && event.target && event.target.value) {
        const isValidated = await messageAPI.contractAddressValidate({
          contractAddress: event.target.value,
          networkId: value.network,
        });
        if (isValidated === true)
          showSuccessToast("contract address already exists");
        if (typeof isValidated === "object") {
          setDataInfo(isValidated);
          setValidated(!isValidated.isValidated);
          setinputName(isValidated.collectionName || "");
          setinputSymbol(isValidated.collectionSymbol || "");
        }
      } else {
        if (value) {
          const isValidated = await messageAPI.contractAddressValidate({
            contractAddress: input,
            networkId: value.network,
          });
          if (isValidated === true) {
            showSuccessToast("contract address");
            return;
          }
          if (typeof isValidated === "object") {
            setDataInfo(isValidated);
            setValidated(!isValidated.isValidated);
            setinputName(isValidated.collectionName || "");
            setinputSymbol(isValidated.collectionSymbol || "");
          }
        }
      }
    } catch (error) {
      captureError(error);
    }
  };

  const handlerSearch = (event: any) => {
    setSearch(event.target.value);
  };

  const filter = useMemo(() => {
    if (selectedAccount?.value) {
      const nft_address = nfts[selectedAccount.value.address];
      if (nft_address) {
        const networksActives = Object.keys(nft_address).filter((network) =>
          Object.keys(selectedChain).includes(network)
        );
        const _nfts: any = [];
        if (networksActives.length > 0) {
          networksActives.forEach((network) => {
            if (
              nft_address[network].type ===
              getType(selectedAccount.type.toLowerCase())
            ) {
              _nfts.push(nft_address[network].contracts);
            }
          });
          return _nfts.flat();
        } else {
          return [];
        }
      }
      return [];
    } else {
      const _nfts: any = {};
      const activeNetworks = Object.keys(selectedChain);
      Object.keys(nfts).forEach((account) => {
        const networks = nfts[account];
        Object.keys(networks).forEach((network) => {
          if (!activeNetworks.includes(network)) {
            return;
          }

          if (!_nfts[network]) {
            _nfts[network] = {};
          }

          const networkData = networks[network];
          networkData.contracts.forEach((contract) => {
            const { contractAddress, balance, collectionName, isEnum } =
              contract;
            if (!_nfts[network][contractAddress]) {
              _nfts[network][contractAddress] = {
                contractAddress: contractAddress,
                balance: 0,
                name: collectionName,
                isEnum: isEnum,
                data: [],
              };
            }

            _nfts[network][contractAddress].balance += balance;
            _nfts[network][contractAddress].data.push(contract);

            let firstImage = null;

            if (
              contract.nftsData &&
              contract.nftsData.length > 0 &&
              contract.nftsData[0].image
            ) {
              firstImage = contract.nftsData[0].image;
            }
            if (firstImage) {
              _nfts[network][contractAddress].image = firstImage;
            }
          });
        });
      });

      return _nfts;
    }
  }, [selectedAccount, selectedChain, chains, nfts]);

  const collections = useMemo(() => {
    const allChains = chains.map((_chains) => _chains.chains).flat();
    const _filters: Chain[] = [];
    allChains.forEach((chain) => {
      let _chain: Chain;
      if (selectedAccount?.value) {
        if (
          Object.keys(selectedChain).includes(chain.id) &&
          getType(selectedAccount.type.toLowerCase()) === chain.type &&
          getType(selectedAccount.type.toLowerCase()) !== ChainType.OL
        ) {
          _chain = {
            name: chain.name,
            network: chain.id,
            logo: chain.logo,
            type: chain.type,
          };
          _filters.push(_chain);
        }
        return;
      }
      const _account = accounts.find(
        (__account) => __account.value?.address === selectedAddress
      );
      if (
        Object.keys(selectedChain).includes(chain.id) &&
        _account &&
        getType(_account.type.toLowerCase()) === chain.type
      ) {
        _chain = {
          name: chain.name,
          network: chain.id,
          logo: chain.logo,
          type: chain.type,
        };
        _filters.push(_chain);
      }
    });
    return _filters;
  }, [chains, selectedAccount]);

  const addCollection = async () => {
    try {
      handlerClearInput();
      setIsOpen(false);
      await messageAPI.getCollection({
        data: dataInfo,
        networkId: value.network,
      });
      showSuccessToast("successful operation");
    } catch (error) {
      captureError(error);
      showErrorToast(error);
    }
  };

  useEffect(() => {
    handlerInput();
  }, [value, dataInfo.isValidated, selectedAddress]);
  useEffect(() => {
    setValue(collections[0]);
  }, [nfts]);

  return (
    <div className="flex flex-col gap-5 bg-[#343A40] p-5  rounded-xl absolute top-[16rem] left-[-1rem] h-auto min-h-[65vh] w-[354px] ">
      <div className="flex justify-between relative">
        <span>Yours Collections</span>
        <button className="text-xl" onClick={handlerValidationModal}>
          <IoAdd />
        </button>
      </div>
      <div className="relative">
        <input
          id="search"
          placeholder="Search" //{t("search")}
          className="input-primary bg-[#1C1C27] pl-8 border-0 font-bold"
          onChange={handlerSearch}
          value={search}
        />
        <CiSearch className="absolute top-1/2 left-2 transform font-mediums -translate-y-1/2 text-white" />
      </div>
      <div className="flex justify-between flex-wrap gap-5 relative h-auto mb-[4rem]">
        {selectedAccount?.value
          ? Array.isArray(filter) &&
            filter.map((nft: NFTContract, index: number) => (
              <ShowCollection key={index} nftContract={nft} />
            ))
          : Object.keys(filter).map((network, index) => (
              <ShowCollection
                key={index}
                groups={filter[network]}
                isGroup={true}
              />
            ))}
      </div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={handlerClearInput}>
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
                <Dialog.Panel
                  className={`relative w-[357px] transform overflow-auto rounded-b-2xl bg-[#171720] ${
                    selectedAccount?.value ? "pt-20 pb-7" : "py-7"
                  }  px-4 text-left align-middle shadow-xl h-fit transition-all mt-[10%] p-7 h-[20rem] space-y-5`}
                >
                  {value && (
                    <SelectableAssetBuy
                      value={value || {}}
                      defaulValue={value || {}}
                      options={collections}
                      onChange={(asset) => setValue(asset)}
                    />
                  )}
                  <button
                    data-testid="chain-button"
                    className="absolute top-2 right-6"
                    onClick={handlerClearInput}
                  >
                    <TfiClose className="font-thin text-[0.7rem]" />
                  </button>
                  <div className="w-full flex flex-col gap-5">
                    <div className="w-full flex flex-col">
                      <input
                        type="text"
                        className={`border-[1.5px] bg-transparent w-full h-[2rem] input  w-full mt-2 border-[#636669] text-base bg-transparent text-white px-2 py-4  !rounded-lg hasData ${
                          dataInfo.isValidated === false && "border-red-500"
                        }`}
                        onChange={(event) => {
                          handlerInput(event);
                          setInput(event.target.value);
                        }}
                        placeholder="Contract Address"
                        value={input}
                      />
                      {dataInfo.isValidated === false && (
                        <span className="text-red-500 text-xs ml-5">
                          Invalid address
                        </span>
                      )}
                    </div>
                    <input
                      id="name"
                      type="text"
                      className={`border-[1.5px] bg-transparent  w-full h-[2rem] input  w-full mt-2  border-[#636669] border-gray-300 text-base bg-transparent text-white px-2 py-4  !rounded-lg hasData `}
                      placeholder="Name"
                      value={inputName}
                      disabled
                    />
                    <input
                      id="symbol"
                      type="text"
                      className={`border-[1.5px] bg-transparent w-full h-[2rem] input  w-full mt-2  border-[#636669] border-gray-300 text-base bg-transparent text-white px-2 py-4  !rounded-lg hasData`}
                      placeholder="Symbol"
                      value={inputSymbol}
                      disabled
                    />
                  </div>

                  <Button
                    onClick={addCollection}
                    classname="w-full"
                    isDisabled={validated}
                  >
                    add
                  </Button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};
