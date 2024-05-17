
import { PageWrapper } from "@src/components/common";
import { useEffect } from "react";
import { HeaderBack } from "@src/components/common/HeaderBack"
import { useAccountContext } from "@src/providers";
import { useNavigate, useLocation } from "react-router-dom";
import { Wallet } from "./Wallet";
import { Footer } from "./Footer"
import { useTranslation } from "react-i18next";



export const BalanceAccounts = () => {
    const {
        state: { accounts }
      } = useAccountContext();
    const location = useLocation();
    const {assets} = location.state;
    const _account = accounts.filter((account) => assets.some((asset) => asset.accountKey === account.key))  
    useEffect(() =>{
    }, [])

    
const { t } = useTranslation("balance");
  const navigate = useNavigate()

  
  return (
    <>
    <PageWrapper contentClassName="!h-[90vh]">
       <div className="h-full flex flex-col overflow-auto settings-container">
       <HeaderBack title={t("accounts.accounts")} navigate={navigate}/>
       <div className="flex flex-col gap-2 h-full">
        {
            _account.map((account) => <>
              <Wallet address={account.value.address} name={account.value.name} type={account.type} key={account.key} _asset={assets.find((asset) => asset.accountKey === account.key)} showBalanceforAsset={true}/>
            </>)
        }
       </div>
         
      </div>
    </PageWrapper>
    <Footer/>
    </>
    
  )
};
