import { useTranslation } from "react-i18next";
import { PageWrapper } from "./PageWrapper";
import logo from "/logo.svg";

export const Error = () => {
  const { t } = useTranslation("common");

  return (
    <PageWrapper contentClassName="bg-[#29323C] h-full">
      <img src={logo} className="mx-auto mt-20 mb-5 w-36 md:w-40 rotate-180" />
      <p className="font-medium text-2xl md:text-3xl mb-2 text-center">
        {t("error_message")}
      </p>
    </PageWrapper>
  );
};
