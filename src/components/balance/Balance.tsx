import { PageWrapper } from "../common/PageWrapper";
import { Account } from "./Account";
import { Activity } from "./Activity";
import { Assets } from "./Assets";
import { ChainSelector } from "./ChainSelector";
import { TotalBalance } from "./TotalBalance";
import { Tab } from "@headlessui/react";

const TABS = [
  {
    name: "Assets",
    component: <Assets />,
  },
  {
    name: "Activity",
    component: <Activity />,
  },
];

export const Balance = () => {
  return (
    <>
      <header className="flex justify-between px-3 bg-[#343A40] py-1 relative items-center">
        <ChainSelector />
        <Account />
      </header>
      <PageWrapper contentClassName="py-6">
        <div className="flex flex-col">
          <TotalBalance />

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
            <Tab.Panels className="mt-2">
              {TABS.map((tab, idx) => (
                <Tab.Panel key={idx}>{tab.component}</Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </PageWrapper>
    </>
  );
};
