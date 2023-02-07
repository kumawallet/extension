import { useTranslation } from "react-i18next";
import logo from "@src/assets/img/logo.svg";
import { PageWrapper } from "../common/PageWrapper";
import { useNavigate } from "react-router-dom";
import { ADD_ACCOUNT } from "../../routes/paths";

export const Home = () => {
  const { t } = useTranslation("home");

  const navigate = useNavigate();

  const goToAccounts = () => {
    localStorage.setItem("welcome", String(true));
    navigate(ADD_ACCOUNT);
  };

  return (
    <PageWrapper>
      <img src={logo} className="mx-auto mt-20 mb-5 w-36 md:w-40" />
      <p className="font-medium text-2xl md:text-3xl mb-2 text-center">
        {t("welcome")}
      </p>
      <p className="font-light text-xs md:text-sm mb-12 text-center">
        {t("description")}
      </p>
      <button
        className="font-medium text-base bg-custom-green-bg w-full py-2 md:py-4 rounded-md mx-auto"
        onClick={goToAccounts}
      >
        {t("button_text")}
      </button>
    </PageWrapper>
  );
};
