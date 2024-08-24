import { PageWrapper } from "@src/components/common";
import { HeaderBack } from "@src/components/common/HeaderBack";
import { useNavigate, useLocation } from "react-router-dom";
import { Footer } from "./Footer";
import { useTranslation } from "react-i18next";
import { useAssetContext } from "@src/providers";
import { useMemo } from "react";
import { Asset } from "./Asset";
import { formatAmountWithDecimals } from "@src/utils/assets";
import { AssetAccount } from "@src/types";
import { AccountsStore } from "@polkadot/extension-base/stores";



export type assetNetwork =  {
    balance: string | number;
    amount: number;
    symbol: string;
    decimals: number;
    id: string;
    accountKey: string;
    network: string;
    accounts ?: any;

  }[]

export const AssetNetwork = () => {
  const { t } = useTranslation("balance");
  const navigate = useNavigate();

  const {
    state: { asset },
  } = useLocation();
  const {
    state: { assets, isLoadingAssets },
  } = useAssetContext();

  const assetsForNetwork = useMemo(
    ()=> {

    const outputObject:assetNetwork = [];

    if (Object.keys(assets).length !== 0) {
      Object.keys(assets).forEach((accountKey) => {
        const networks = assets[accountKey];
        Object.keys(networks).forEach((network) => {
          const assets = networks[network].assets;
          assets.forEach((_asset) => {
            if (_asset.symbol === asset.symbol) {
                outputObject.push({ 
                id: _asset.id,
                balance: Number(_asset.balance),
                amount: Number(_asset.amount), 
                accountKey,
                decimals: _asset.decimals,
                symbol: _asset.symbol,
                network: network  });
            }
            
          });
        });
      });
     // return outputObject
    let newAssets : assetNetwork = [];
    outputObject.forEach((asset) => {
        const index = newAssets.findIndex((_asset) => _asset.network === asset.network);
        if (index !== -1) {
          newAssets[index].balance = (
            Number(newAssets[index].balance) + (asset.balance as number)
          ).toString();
          newAssets[index].amount += asset.amount;
          newAssets[index].accounts[asset.accountKey] = asset
        } else {
            const _asset = {
                ...asset,
                accounts: {
                    [asset.accountKey] : asset
                }
            } 
          newAssets.push(_asset);
        }
        });
    newAssets.forEach((asset, index) => {
        newAssets[index].balance = formatAmountWithDecimals((asset.balance as number),3,asset.decimals)
    })

    newAssets = newAssets.sort((a, b) => {
        return Number(b.balance) - Number(a.balance);
      });
    return newAssets
    }}, [assets]
  )

  return (
    <>
      <PageWrapper contentClassName="!h-[90vh]">
        <div className="h-full flex flex-col overflow-auto settings-container">
          <HeaderBack title={t("assets")} navigate={navigate} />
          <div data-testid="wallets" className="flex flex-col gap-2 h-full">
            {
                assetsForNetwork && assetsForNetwork?.length> 0 && assetsForNetwork?.map((_asset,index) => 
                    <Asset asset={_asset} key={index} isDetail={true}/>
            )
                
            } 
          </div>
        </div>
      </PageWrapper>
      <Footer />
    </>
  );
};