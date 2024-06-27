import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PageWrapper, Button, HeaderBack } from "@src/components/common";
import { BsChevronRight } from "react-icons/bs";
import {  styleButtomNav } from "../../style/style";
import { CHANGE_PASSWORD, SETTINGS_AUTOLOCK } from "@src/routes/paths";

export const Security = () => {
  const { t } = useTranslation("security");
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <HeaderBack navigate={navigate} title={t("title")}/>
      <Button
        data-testid="change-password"
        variant="contained-black"
        classname={`${styleButtomNav} w-full justify-between`}
        onClick={() => navigate(CHANGE_PASSWORD)}
      >
        <p className="text-sm">{t("restore_password")}</p>
        <BsChevronRight />
      </Button>
      <Button variant="contained-black" classname={`${styleButtomNav} w-full justify-between`} onClick={() => navigate(SETTINGS_AUTOLOCK)} >
        <p className="text-sm">{t('auto-lock')}</p>
        <BsChevronRight />
      </Button>

      {/* <Button variant="contained-black" classname={`${styleButtomNav} w-full justify-between`}  >
        <p className="text-sm ">{t("trusted_sites")}</p>
        <BsChevronRight />
      </Button> */}
    </PageWrapper>
  );
};
