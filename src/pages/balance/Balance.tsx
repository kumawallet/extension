import { useMemo } from "react";
import { PageWrapper } from "@src/components/common/PageWrapper";
import { Tab } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { Activity, Assets, Header, Footer, TotalBalance } from "./components";
import { useLocation } from "react-router-dom";
import { useThemeContext } from "@src/providers";

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

  const TABS = useMemo(() => {
    return [
      {
        name: t("assets"),
        component: <Assets />,
      },
      {
        name: t("activity"),
        component: <Activity />,
      },
    ];
  }, []);

  return (
    <>
      <Header />
      <PageWrapper contentClassName="pt-6 pb-16">
        <div className="flex flex-col">
          <TotalBalance />

          <Tab.Group defaultIndex={state?.tab === "activity" ? 1 : 0}>
            <Tab.List
              className={`flex space-x-1 p-1 border-b-[1px] border-b-${color}-primary mt-5`}
            >
              {TABS.map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    `px-4 py-1 focus:outline-none relative ${
                      selected
                        ? `text-${color}-secondary active-tab after:bg-${color}-fill`
                        : "text-white"
                    }`
                  }
                >
                  {tab.name}
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
