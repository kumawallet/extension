import { useTranslation } from "react-i18next";
import { BsChevronRight } from "react-icons/bs";
import { PageWrapper, SelectLanguage } from "@src/components/common";
import { OptionButton } from "./OptionButton";
import { CREATE_ACCOUNT, IMPORT_ACCOUNT } from "@src/routes/paths";
import { getWebAPI } from "@src/utils/env";
import { useNavigate } from "react-router-dom";

const WebAPI = getWebAPI();

export const AddAccount = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("add_account");

  const openTab = async (route: string) => {
    const tab = await WebAPI.tabs.getCurrent();

    if (!tab) {
      const url = WebAPI.runtime.getURL(
        `src/entries/newtab/index.html?route=${route}`
      );
      WebAPI.tabs.create({ url });
      return;
    }

    navigate(route);
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
