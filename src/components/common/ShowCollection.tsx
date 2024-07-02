import { FC, useEffect } from "react";
import { NFTData } from "@src/types"
interface ShowCollectionProps {
  contractAddress?: string;
  collectionName: string;
  collectionSymbol: string;
  balance: number;
  isEnum?: boolean;
  nftsData?: NFTData[]

}

export const ShowCollection: FC<ShowCollectionProps> = ({
  collectionName,
  balance,
  nftsData
}) => {
  return (
    <div className={`flex flex-col bg-[#212529] rounded-xl overflow-hidden md:w-[8rem] w-[7rem] `}>
      { nftsData && nftsData[0].image && (<img src={nftsData[0].image} alt="image" className="md:h-[7rem] h-[5rem]"/>)}
      <div className={`w-full flex flex-col items-center ${nftsData && nftsData[0].image ? "": "md:mt-[7rem] mt-[5rem]"}`}>
        <span>{collectionName}</span>
        <span>{`${balance} items`}</span>
      </div>
    </div>
  );
};
