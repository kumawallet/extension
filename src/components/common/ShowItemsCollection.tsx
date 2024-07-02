import { NFTData } from "@src/types";
import { FC } from "react";
interface ShowCollectionProps {
  contractAddress?: string;
  collectionName: string;
  collectionSymbol: string;
  balance: string;
  isEnum?: boolean;
  nftsData?: NFTData[]

}

export const ShowCollection: FC<ShowCollectionProps> = ({
  collectionName,
  balance,
  nftsData
}) => {
  return (
    <div className={`flex flex-col bg-[#212529] rounded-xl overflow-hidden w-[8rem] `}>
      { nftsData && nftsData[0].image && (<img src={nftsData[0].image} alt="image" />)}
      <div className={`w-full flex flex-col items-center ${nftsData && nftsData[0].image ? "": "mt-[7rem]"}`}>
        <span>{collectionName}</span>
        <span>{`${balance} items`}</span>
      </div>
    </div>
  );
};