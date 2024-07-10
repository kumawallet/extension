import { HeaderBack } from "@src/components/common/HeaderBack";
import { PageWrapper, Button, TxSummary } from "@src/components/common";
import { Footer } from "@src/pages/balance/components";
import { useNetworkContext } from "@src/providers";
import {
  getHash
} from "@src/utils/transactions-utils";

import { styleAD } from "./style/activityDetails";
import { useLocation, useNavigate } from "react-router-dom";
import { messageAPI } from "@src/messageAPI/api";
import { useEffect, useState } from "react";
import { BALANCE } from "@src/routes/paths";
import { useLoading, useToast } from "@src/hooks";


interface data   {
  tokenId: string;
    name?: string;
    description?: string;
    image?: string;
    attributes?: any;
    external_url?: string;
    animation_url?: string;
    audio_url?: string; 
    owner: string;
    network: string;
    contractAddress: string;
    recipientAddress: string;
    fee: string
  }

export const ConfirmTxNFT = () => {

  const location = useLocation();
  const data: data = location.state;
  const { state: { chains}} = useNetworkContext()
  const navigate = useNavigate()
  const network = chains.map((_chains) => _chains.chains).flat()
  const networkName = network.find((_network) => _network.id === data.network) || { name: ""}
  const { showSuccessToast, showErrorToast } = useToast();
  const { isLoading, starLoading, endLoading } = useLoading()
  const [fee, setFee] = useState("");
  const getFee = async() => {
    starLoading()
    await messageAPI.getFeeNFT((fee) => {
      setFee(fee);
    });
    endLoading()
   
  }
  useEffect(() => {
    getFee();
  }, [])

  const transaction = {
    ["From"]: (
      <div className={styleAD.itemsValue}>
        {getHash(data.owner)}
      </div>
    ),
    ["To"]: (
      <div className={styleAD.itemsValue}>
        {getHash(data.recipientAddress)}
      </div>
    ),
    ["Network"]: (
      <>
          <div className="grid w-full">
              {networkName.name}
          </div>
      </>
    ),
    ["NFT"]: (
          <div className="grid w-full">
            {data.name}
          </div>
    ),
    ["Estimate Fee"]: (
      <div className={styleAD.containerNetworks}>
        {fee}
      </div>
    ) 
  };

    const onClick = async() => {
      try{
        navigate(BALANCE, {
          state: {
            tab: "activity",
          },
        });
      await messageAPI.sendTxNFT();
      showSuccessToast("successful operation")
      
      }
      catch(error){
        showErrorToast("Error ConfirmTxNFT")
      }
    }
    

  return (
    <PageWrapper contentClassName="mt-1/2 ">
      <div className="mt-1 m-3">
        <HeaderBack title={"Transfer confirmation"} navigate={navigate} />
        <TxSummary tx={transaction} />
      </div>
      <div className="w-full flex justify-between gap-5">
                    
                    <Button  classname="w-full">
                        Cancel
                    </Button>
                    <Button  classname="w-full" onClick={onClick} isDisabled={isLoading}>
                        Sent
                    </Button>
                
                </div>
      <Footer />
    </PageWrapper>
  );
};

