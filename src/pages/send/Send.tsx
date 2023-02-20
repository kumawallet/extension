import { PageWrapper } from "@src/components/common";
import { useTranslation } from "react-i18next";
import { TbChevronRight } from "react-icons/tb";
import { SelectableChain } from "./components/SelectableChain";
import { CHAINS } from "../../constants/chains";

export const Send = () => {
  const { t } = useTranslation("send");

  const goToSignTransfer = () => {
    console.log("gotosign");
  };

  return (
    <PageWrapper contentClassName="bg-[#29323C]">
      <div className="mx-auto">
        <div className="mb-7">
          <p className="font-medium text-2xl">{t("title")}</p>
        </div>
        <div className="flex gap-2 justify-center items-center">
          <div className="px-2">
            <p className="mb-2">From:</p>
            <SelectableChain selectedChain={{ name: "polkadtot" }} />
          </div>
          <TbChevronRight size={26} />
          <div className="px-2">
            <p className="mb-2">To:</p>
            <SelectableChain
              canSelectChain={true}
              selectedChain={{ name: "Astar" }}
              optionChains={CHAINS[0].chains}
            />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <p>{t("destination_account")}</p>
            <input
              className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white "
              value="0x123"
            />
          </div>
          <div>
            <p>{t("amount")}</p>
            <div className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white">
              <input className="bg-transparent w-8/12 outline-0" />
              <div className="w-4/12">selector</div>
            </div>
          </div>
          <div className="flex">
            <p>Fee</p>
            <p>0.001ASTR</p>
          </div>
        </div>

        <button
          className="font-medium text-base bg-custom-green-bg w-full py-2 md:py-4 rounded-md mx-auto"
          onClick={goToSignTransfer}
        >
          {t("continue")}
        </button>
      </div>
    </PageWrapper>
  );
};
