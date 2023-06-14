import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import logo from "/logo.svg";
import { PageWrapper } from "@src/components/common/PageWrapper";
import { ADD_ACCOUNT } from "@src/routes/paths";
import { Button, FullScreenFAB, SelectLanguage } from "@src/components/common";

export const Welcome = () => {
  const { t } = useTranslation("welcome");

  const navigate = useNavigate();

  const goToAccounts = () => {
    localStorage.setItem("welcome", String(true));
    navigate(ADD_ACCOUNT);
  };

  return (
    <>
      <PageWrapper>
        <SelectLanguage />
        <img src={logo} className="mx-auto mt-20 mb-5 w-36 md:w-40" />
        <p className="font-medium text-2xl md:text-3xl mb-2 text-center">
          {t("welcome_message")}
        </p>
        <p className="font-light text-xs md:text-sm mb-12 text-center">
          {t("description")}
        </p>
        <Button
          classname="font-medium text-base  w-full py-2 md:py-4 mx-auto"
          onClick={goToAccounts}
        >
          {t("button_text")}
        </Button>
      </PageWrapper>
      <footer className="fixed bottom-0 left-0 right-0 py-4 px-3 flex justify-end gap-4 max-w-3xl w-full mx-auto">
        <FullScreenFAB />
      </footer>
    </>
  );
};
