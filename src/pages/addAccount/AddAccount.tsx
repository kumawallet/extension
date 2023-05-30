import { useTranslation } from "react-i18next";
import { BsChevronRight } from "react-icons/bs";
import { PageWrapper, SelectLanguage } from "@src/components/common";
import { OptionButton } from "./OptionButton";
import { CREATE_ACCOUNT, IMPORT_ACCOUNT } from "@src/routes/paths";

export const AddAccount = () => {
  const { t } = useTranslation("add_account");

  const openTab = (route: string) => {
    const url = chrome.runtime.getURL(
      `src/entries/newtab/index.html?route=${route}`
    );
    chrome.tabs.create({ url });
  };

  return (
    <PageWrapper>
      <div className="mb-14 flex items-center justify-between">
        <p className="font-medium text-2xl">{t("title")}</p>
        <SelectLanguage />
      </div>
      <div className="flex flex-col gap-8">
        <OptionButton onClick={() => openTab(IMPORT_ACCOUNT)}>
          <p className="font-normal text-xl">{t("import_wallet")}</p>
          <BsChevronRight size={24} />
        </OptionButton>
        <OptionButton onClick={() => openTab(CREATE_ACCOUNT)}>
          <p className="font-normal text-xl">{t("create_wallet")}</p>
          <BsChevronRight size={24} />
        </OptionButton>
      </div>
    </PageWrapper>
  );
};
