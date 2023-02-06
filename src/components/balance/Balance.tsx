import { useEffect, useState } from "react";
import { PageWrapper } from "../common/PageWrapper";
import { Account } from "./Account";
import { Activity } from "./Activity";
import { Assets } from "./Assets";
import { ChainSelector } from "./ChainSelector";
import { TotalBalance } from "./TotalBalance";
import { Tab } from "@headlessui/react";
import { DecryptFAB } from "../common/DecryptFAB";
import { Settings } from "../settings";
import { FullScreenFAB } from "../common/FullScreenFAB";
import { ApiPromise } from "@polkadot/api";
import { useAccountContext, useNetworkContext } from "@src/providers";
import { getNatitveAssetBalance } from "@src/utils/assets";
import { Account as AccountEntity } from "@src/storage/entities/Accounts";
import { Chain } from "@src/contants/chains";
import { getAssetUSDPrice } from "../../utils/assets";
import { useToast } from "@src/hooks";

const TABS = [
  {
    name: "Assets",
    component: <Assets assets={[]} isLoading={true} />,
  },
  {
    name: "Activity",
    component: <Activity />,
  },
];

export interface Asset {
  name: string;
  symbol: string;
  decimals: number;
  amount: number;
  usdPrice: number;
}

export const Balance = () => {
  const {
    state: { api, selectedChain },
  } = useNetworkContext();

  const {
    state: { selectedAccount },
  } = useAccountContext();

  const { showErrorToast } = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    if (api && selectedAccount.value?.address && selectedChain) {
      setIsLoadingAssets(true);

      getAssets(api, selectedAccount, selectedChain);
    }
  }, [api, selectedAccount, selectedChain]);

  const getAssets = async (
    api: ApiPromise,
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
      showErrorToast(error);
    }
  };

  return (
    <>
      <header className="flex justify-between px-3 bg-[#343A40] py-1 relative items-center max-w-3xl w-full mx-auto">
        <ChainSelector />
        <Account />
      </header>
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

      {/* TODO: move to separate component */}
      <footer className="fixed bottom-0 left-0 right-0 py-2 bg-[#343A40] px-2 flex justify-end gap-20 max-w-3xl w-full mx-auto">
        <FullScreenFAB />
        <DecryptFAB />
        <Settings />
      </footer>
    </>
  );
};
