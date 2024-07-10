import { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface NFTData {
  tokenId?: string;
  name?: string;
  description?: string;
  image?: string;
  attributes?: any[];
  external_url?: string;
  animation_url?: string;
  audio_url?: string;
}

interface ShowCollectionItemProps {
  data: NFTData;
  network: string;
  contractAdress: string;
}
export const ShowCollectionItem: FC<ShowCollectionItemProps> = ({
  data,
  network,
  contractAdress
}) => {
  const _data  = {
        ...data,
        network: network,
        contractAddress: contractAdress
  }
  const navigate = useNavigate();
  return (
    <div 
        className={`flex flex-col bg-[#212529] rounded-xl overflow-hidden w-[7rem] h-[8rem] overflow-hidden cursor-pointer`} 
        onClick={() => navigate("/nft-details", { state: _data })}>
      <div className=" !h-[14rem] w-full flex items-center justify-center">
        <img 
          src={!data.image  || data.image && data.image === "/" ? "/icon-128.png" : data.image} 
          alt="image"  
          className={`${data.image === "/" || !data.image ? "md:h-[3rem] h-[2rem]" : "h-full"} object-cover`}/>
      </div>
      
      <div className={`w-full flex flex-col items-center justify-center ${ data.image ? "md:h-[7rem] h-[5rem] object-contain": "mt-[7rem] p-3"}`}>
        <span className={`text-bold ${data.name && data?.name?.length > 10 ? "text-xs" : "text-base"} `}>{data?.name}</span>
      </div>
    </div>
  );
};