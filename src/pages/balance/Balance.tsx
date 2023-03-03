import { useEffect, useState, useMemo } from "react";
import { PageWrapper } from "@src/components/common/PageWrapper";
import { Tab } from "@headlessui/react";
import { ApiPromise } from "@polkadot/api";
import { useAccountContext, useNetworkContext } from "@src/providers";
import { getNatitveAssetBalance } from "@src/utils/assets";
import { Chain } from "@src/constants/chains";
import { getAssetUSDPrice } from "@src/utils/assets";
import { useToast } from "@src/hooks";
import { useTranslation } from "react-i18next";
import { ethers } from "ethers";
import AccountEntity from "@src/storage/entities/Account";
import { Activity, Assets, Header, Footer, TotalBalance } from "./components";

export interface Asset {
  name: string;
  symbol: string;
  decimals: number;
  amount: number;
  usdPrice: number;
}

export const Balance = () => {
  const {
    state: { api, selectedChain, rpc, type },
  } = useNetworkContext();

  const {
    state: { selectedAccount },
  } = useAccountContext();

  const { t } = useTranslation("balance");
  const { t: tCommon } = useTranslation("common");

  const TABS = useMemo(() => {
    return [
      {
        name: t("assets"),
        component: <Assets assets={[]} isLoading={true} />,
      },
      {
        name: t("activity"),
        component: <Activity />,
      },
    ];
  }, []);

  const { showErrorToast } = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    setIsLoadingAssets(true);
  }, [rpc, api]);

  useEffect(() => {
    if (
      rpc &&
      selectedAccount?.value?.address &&
      selectedChain &&
      type &&
      api
    ) {
      if (selectedAccount?.type?.includes(type)) {
        setIsLoadingAssets(true);

        getAssets(api, selectedAccount, selectedChain);
      }
    }
  }, [rpc, selectedAccount, type, api]);

  const getAssets = async (
    api: ApiPromise | ethers.providers.JsonRpcProvider | null,
    account: AccountEntity,
    chain: Chain
  ) => {
    try {
      const nativeAsset = await getNatitveAssetBalance(
        api,
        account.value.address,
        chain?.nativeCurrency.decimals || 1
      );

      const usdPrice = await getAssetUSDPrice(
        chain.nativeCurrency.name.toLowerCase()
      );

      const totalBalance = usdPrice * nativeAsset;

      setAssets([
        {
          ...chain.nativeCurrency,
          amount: nativeAsset,
          usdPrice: totalBalance || 0,
        },
      ]);
      setIsLoadingAssets(false);
      setTotalBalance(totalBalance || 0);
    } catch (error) {
      setIsLoadingAssets(false);
      setAssets([]);
      setTotalBalance(0);
      showErrorToast(tCommon(error as string));
    }
  };

  return (
    <>
      <Header />
      <PageWrapper contentClassName="py-6">
        <div className="flex flex-col">
          <TotalBalance
            accountName={selectedAccount?.value?.name}
            balance={totalBalance}
          />

          <Tab.Group>
            <Tab.List className="flex space-x-1 p-1 border-b-[1px] border-b-[#343A40] mt-5">
              {TABS.map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    `px-4 py-1 focus:outline-none ${
                      selected ? "text-custom-green-bg" : "text-white"
                    }`
                  }
                >
                  {tab.name}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-2 px-4">
              <Tab.Panel key={0}>
                <Assets assets={assets} isLoading={isLoadingAssets} />
              </Tab.Panel>
              <Tab.Panel key={1}>
                <Activity />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </PageWrapper>
      <Footer />
    </>
  );
};
