import { useEffect, useState } from "react";
import { PageWrapper } from "@src/components/common/PageWrapper";
import { Tab } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { Activity, Assets, Header, Footer, TotalBalance } from "./components";
import { useLocation } from "react-router-dom";
import { useNetworkContext, useThemeContext } from "@src/providers";

export interface Asset {
  name: string;
  symbol: string;
  decimals: number;
  amount: number;
  usdPrice: number;
}

export const Balance = () => {
  const { t } = useTranslation("balance");
  const { state } = useLocation();
  const { color } = useThemeContext();
  const {
    state: { selectedChain },
  } = useNetworkContext();

  const [selectedIndex, setSelectedIndex] = useState(0);

  const TABS = [t("assets"), t("activity")];

  useEffect(() => {
    setSelectedIndex(0);
  }, [selectedChain?.name]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [selectedChain?.name]);

  return (
    <>
      <Header />
      <PageWrapper contentClassName="pt-6 pb-16">
        <div className="flex flex-col">
          <TotalBalance />

          <Tab.Group
            selectedIndex={selectedIndex}
            onChange={setSelectedIndex}
            defaultIndex={state?.tab === "activity" ? 1 : 0}
          >
            <Tab.List
              className={`flex space-x-1 p-1 border-b-[1px] border-b-${color}-primary mt-5`}
            >
              {TABS.map((tab) => (
                <Tab
                  key={tab}
                  className={({ selected }) =>
                    `px-4 py-1 focus:outline-none relative ${selected
                      ? `text-${color}-secondary active-tab after:bg-${color}-fill`
                      : "text-white"
                    }`
                  }
                >
                  {tab}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-2 px-4">
              <Tab.Panel key={0}>
                <Assets />
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
