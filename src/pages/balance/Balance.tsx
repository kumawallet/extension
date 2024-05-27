import { useEffect, useState } from "react";
import { PageWrapper } from "@src/components/common/PageWrapper";
import { Tab } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { Assets, Header, Footer, TotalBalance, Actions, AccountSelected, Activity } from "./components";
import { useLocation } from "react-router-dom";
import { useNetworkContext } from "@src/providers";

const Bg = () => (
  <svg width="739" height="868" viewBox="0 0 739 868" fill="none" xmlns="http://www.w3.org/2000/svg" className="bottom-0 left-0 w-full h-[62%] md:h-2/3 object-cover z-0 fixed">
    <g filter="url(#filter0_f_1173_150)">
      <rect x="180" y="242" width="430" height="450" rx="40" fill="#6C387A" fillOpacity="1" />
      <rect x="0.5" y="242.5" width="738" height="530" rx="27.5" stroke="#FDF7F7" />
    </g>
    <defs>
      <filter id="filter0_f_1173_150" x="-242" y="0" width="1223" height="1015" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur stdDeviation="121" result="effect1_foregroundBlur_1173_150" />
      </filter>
    </defs>
  </svg>
)

export const Balance = () => {
  const { t } = useTranslation("balance");
  const { state } = useLocation();
  const {
    state: { selectedChain },
  } = useNetworkContext();

  const [selectedIndex, setSelectedIndex] = useState(0);

  const TABS = [t("assets"), t("activity")];

  useEffect(() => {
    setSelectedIndex(0);
  }, [selectedChain?.name]);




  return (
    <>
      <Header />
      <PageWrapper contentClassName="flex-1 !px-0" innerContentClassName=" !bg-[#0C0C0C]">
        <Bg />
        <div className="flex flex-col pt-3 pb-16 relative">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col">
              <TotalBalance />
              <AccountSelected />
            </div>
            <Actions />
          </div>
          <Tab.Group
            selectedIndex={selectedIndex}
            onChange={setSelectedIndex}
            defaultIndex={state?.tab === "activity" ? 1 : 0}
          >
            <Tab.List
              className="flex space-x-1 p-1 mt-5"
            >
              {TABS.map((tab) => (
                <Tab
                  key={tab}
                  className={({ selected }) =>
                    `px-4 py-1 focus:outline-none relative ${selected
                      ? `text-primary-default active-tab`
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
