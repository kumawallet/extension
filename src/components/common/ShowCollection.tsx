import { FC } from "react";
import { NFTContract } from "@src/types"
import { useNavigate } from "react-router-dom";
interface ShowCollectionProps {
  nftContract ?: NFTContract;
  groups?: any;
  isGroup?: boolean;
}

export const ShowCollection: FC<ShowCollectionProps> = ({
  nftContract,
  groups,
  isGroup = false
}) => {
  const navigate = useNavigate();
  return (
    <>
    { !isGroup && nftContract ? nftContract.balance > 0 && (
      <div className={`flex flex-col bg-[#212529] rounded-xl overflow-hidden w-[7rem] h-[8rem] cursor-pointer `} onClick={()=> nftContract?.isEnum && navigate("/show-collection",{state:nftContract})}>
          <div className=" !h-[14rem] w-full flex items-center justify-center">
              { nftContract.nftsData && (<img 
                                                  src={nftContract.nftsData[0]?.image === "/" || !nftContract.nftsData[0]?.image ? "/icon-128.png" : nftContract.nftsData[0]?.image} 
                                                  alt="image"  
                                                  className={`${nftContract.nftsData[0]?.image === "/" || !nftContract.nftsData[0]?.image ? "md:h-[3rem] h-[2rem] " : "h-full w-full"} object-cover`}
                                                  />)}
          </div>
          <div className={`w-full flex flex-col items-center ${ nftContract.nftsData[0]?.image === "/" || !nftContract.nftsData[0]?.image ? "": "md:mt-[7rem] mt-[5rem]"}`}>
                <span>{nftContract.collectionName}</span>
                <span>{`${nftContract.balance} items`}</span>
          </div>
    </div>) : isGroup && Object.keys(groups).map((contract) => 
    ( 
      <div key={contract} className={`flex flex-col bg-[#212529] rounded-xl overflow-hidden w-[7rem] h-[8rem] cursor-pointer `} onClick={() => navigate("/show-group-collection", { state: groups[contract] })}>
          <div className=" !h-[14rem] w-full flex items-center justify-center">
              <img 
                    src={groups[contract]?.image === "/" || !groups[contract]?.image ? "/icon-128.png" : groups[contract]?.image} 
                    alt="image"  
                    className={`${groups[contract]?.image === "/" || !groups[contract]?.image ? "md:h-[3rem] h-[2rem] " : "h-full w-full"} object-cover`}
                                                  />
          </div>
          <div className={`w-full flex flex-col items-center ${ groups[contract]?.image === "/" || !groups[contract]?.image ? "": "md:mt-[7rem] mt-[5rem]"}`}>
              <span>{groups[contract].name}</span>
              <span>{`${groups[contract].balance} items`}</span>
          </div>
          {/* {!isHidden && <div className="flex flex-col w-full">
          <HeaderBack title={groups[contract].name} onBack={() => setIsHidden(true)}/>
          <div  className="flex justify-between flex-wrap gap-5 relative h-auto">
      {
        groups[contract].data.map((_contract: NFTContract, index : number) => (
          <div  key={index} className={`flex flex-col bg-[#212529] rounded-xl overflow-hidden w-[7rem] h-[8rem] cursor-pointer `} onClick={() => _contract?.isEnum && navigate("/show-collection",{state:_contract})}>
              <div className=" !h-[14rem] w-full flex items-center justify-center">
                  { _contract.balance> 0 && _contract.nftsData && (<img 
                                                      src={_contract.nftsData[0]?.image === "/" || !_contract.nftsData[0]?.image ? "/icon-128.png" : _contract.nftsData[0]?.image} 
                                                      alt="image"  
                                                      className={`${_contract.nftsData[0]?.image === "/" || !_contract.nftsData[0]?.image ? "md:h-[3rem] h-[2rem] " : "h-full w-full"} object-cover`}
                                                      />)}
              </div>
              <div className={`w-full flex flex-col items-center ${ _contract.nftsData[0]?.image === "/" || !_contract.nftsData[0]?.image ? "": "md:mt-[7rem] mt-[5rem]"}`}>
                    <span>{_contract.collectionName}</span>
                    <span>{`${_contract.balance} items`}</span>
              </div>
        </div>))}
        </div>
        </div>} */}
      </div>
      
        ))}
</>)
}
