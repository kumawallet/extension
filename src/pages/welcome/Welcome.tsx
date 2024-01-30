import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { CREATE_ACCOUNT, IMPORT_ACCOUNT } from "@src/routes/paths";
import {
  Logo,
  // SelectLanguage,
  PageWrapper,
  ColoredBackground,
} from "@src/components/common";
import { OptionButton } from "./components/OptionButton";
import { getWebAPI } from "@src/utils/env";

const WebAPI = getWebAPI();

export const Welcome = () => {
  const { t } = useTranslation("welcome");
  const navigate = useNavigate();

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
    <PageWrapper
      contentClassName="bg-[#1F1432] h-[100dvh] relative !px-0 !py-0"
    >
      <ColoredBackground />
      {/* <SelectLanguage /> */}
      <div className="py-6 px-4">
        <Logo
          className="mx-auto mt-14 w-[15.5rem]"
          fillClassName="fill-chain-default-primary"
          lineClassName="#070707"
        />
        <p className="font-semibold text-2xl -mt-5 mb-2 text-center">
          {t("welcome_message")}
        </p>
        <p className="font-light text-sm mb-9 text-center">
          {t("description")}
        </p>
        <div className="flex flex-col gap-5">
          <OptionButton onClick={() => openTab(CREATE_ACCOUNT)}>
            {t("create_wallet")}
          </OptionButton>
          <OptionButton onClick={() => openTab(IMPORT_ACCOUNT)}>
            {t("import_wallet")}
          </OptionButton>
        </div>

      </div>
    </PageWrapper>
  );
};
