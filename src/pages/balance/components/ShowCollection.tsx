import { HeaderBack } from "@src/components/common";
import { PageWrapper } from "@src/components/common/PageWrapper";
import { ShowCollectionItem } from "@src/components/common/ShowItemsCollection";
import { NFTContract, NFTData } from "@src/types";
import { useLocation, useNavigate } from "react-router-dom";
import { Footer } from "./Footer";

export const ShowCollection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const nft: NFTContract = location.state;

  return (
    <PageWrapper>
      <HeaderBack navigate={navigate} title={nft.collectionName} />
      <div className="flex flex-wrap justify-between gap-y-7">
        {nft.nftsData.map((nftItem: NFTData, index: number) => (
          <ShowCollectionItem
            key={index}
            data={nftItem}
            network={nft.network}
            contractAdress={nft.contractAddress}
          />
        ))}
      </div>
      <Footer />
    </PageWrapper>
  );
};
