
import { Fragment, useEffect, useMemo, useState,  } from "react";
import { Button, ShowCollection }  from "@src/components/common"
// import { useTranslation } from "react-i18next";
// import { useNavigate } from "react-router-dom";
import { useNFTContext } from "@src/providers/nftProvider";
import { IoAdd } from "react-icons/io5";
import { Dialog, Transition } from "@headlessui/react";
import { TfiClose } from "react-icons/tfi";
import { SelectableAssetBuy } from "@src/pages/buy/components/SelectableAsset";
import { useAccountContext, useNetworkContext } from "@src/providers";
//import { Chain } from "@src/types";
import { messageAPI } from "@src/messageAPI/api";
import { SelectAccount } from "@src/pages/send/components/SelectAccount";
import { CiSearch } from "react-icons/ci";
import { getType } from "@src/utils/assets";

export const NFT = () => {
  const { state: {selectedChain, chains}} = useNetworkContext()
  const [isOpen,setIsOpen] = useState(false);
  const [value,setValue] = useState<any>();
  const {state: {nfts}} = useNFTContext();
  const { state: {selectedAccount, accounts}} = useAccountContext()
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<string | undefined>(selectedAccount?.value?.address || accounts[0].value?.address);


  const collections  = useMemo(() => {
  const allChains = chains.map((_chains) => _chains.chains).flat()
  const filters = allChains.filter((chain) => {
    if(selectedAccount?.value){
    if(Object.keys(selectedChain).includes(chain.id)&& getType(selectedAccount.type.toLowerCase()).toLowerCase() === chain.type){
      return{
        name: chain.name,
        network:chain.id,
        logo: chain.logo,
        type: chain.type

      }}
      return
    }
    const _account = accounts.find((__account) => __account.value?.address === selectedAddress)
    if(Object.keys(selectedChain).includes(chain.id)&&_account && getType(_account.type.toLowerCase()) === chain.type){
      return{ 
        name: chain.name,
        network:chain.id,
        logo: chain.logo,
        type: chain.type

      }}
    })
  return filters;
},[chains,selectedAccount])

const handlerInput = (event: any) => {
  setInput(event.target.value);
}

const handlerSearch = (event: any) => {
  setSearch(event.target.value);
}


const addCollection = async() => {
  
  
  if(selectedAccount?.value && value)
  {
    const address= selectedAccount?.value?.address
    const _collection = await messageAPI.getCollection({address,addressContract:input, idNetwork:value.id})
    console.log(_collection,"collection")
    return
  }
  if(selectedAddress && value){
    const _collection = await messageAPI.getCollection({address: selectedAddress,addressContract:input, idNetwork:value.id});
    console.log(_collection, "Collection");

  }
}
useEffect(() => {
  setValue(collections[0]);
}, [ nfts])

  return (
    <div className="flex flex-col flex-wrap gap-5 bg-[#343A40] p-5  rounded-xl absolute top-[17rem] left-[-1rem] h-[65vh] w-[354px]"
    >
      <div className="flex justify-between relative">
        <span>Yours Collections</span>
        <button className="text-xl" onClick={() => setIsOpen(true)}>
          <IoAdd />
        </button>
      </div>
      <div className="relative">
                    <input
                        id="search"
                        placeholder="Search"//{t("search")}
                        className="input-primary bg-[#1C1C27] pl-8 border-0 font-bold"
                        onChange={handlerSearch}
                        value={search}
                    />
                    <CiSearch className="absolute top-1/2 left-2 transform font-mediums -translate-y-1/2 text-white" />
      </div>
      <div className="flex justify-between flex-wrap">
        {
          nfts.length > 0 && nfts.map((nft)=>
            (<ShowCollection key={nft.contractAddress} balance={nft.balance} collectionName={nft.collectionName} collectionSymbol={nft.collectionSymbol}/>)
          )
        }

      </div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
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
                <Dialog.Panel className={`relative w-[357px] transform overflow-hidden rounded-b-2xl bg-[#171720] ${selectedAccount?.value ? "pt-20 pb-7" : "py-7"}  px-4 text-left align-middle shadow-xl h-fit transition-all mt-[10%] p-7 h-[20rem] space-y-5`}>
                {!selectedAccount?.value && (
                  <SelectAccount
                    onChangeValue={(account) => setSelectedAddress(account)}
                    selectedAddress={selectedAddress || null}
                  />
                )}
                {value && (
                  <SelectableAssetBuy 
                  value={value || {}} 
                  defaulValue={value || {} } 
                  options={(collections)}
                  onChange={(asset) => setValue(asset)}/>
                )
                }
                <button
                  data-testid="chain-button"
                  className="absolute top-2 right-6"
                  onClick={() => setIsOpen(false)}
                >
                  <TfiClose className="font-thin text-[0.7rem]" />
                </button>
                  <input 
                  type="text"  
                  className="border-[1.5px] bg-transparent rounded-sm w-full h-[2rem] input  w-full mt-2 relative hasData" 
                  onChange={handlerInput} 
                  value={input}/>
                  <Button onClick={addCollection} classname="w-full">
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
