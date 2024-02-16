import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { CREATE_ACCOUNT, IMPORT_ACCOUNT } from "@src/routes/paths";
import {
  Button,
} from "@src/components/common";
import { AccountFormWrapper } from "@src/components/accountForm";

export const Welcome = () => {
  const { t } = useTranslation("welcome");
  const navigate = useNavigate();


  return (
    <AccountFormWrapper
      topMessage={
        <div className="px-2 mb-3 text-center text-base">
          {t("welcome_message")}
        </div>
      }
      description={t("description")}
      centerInnerTitle
    >
      <div className="flex flex-col -z">
        <Button classname="w-full" onClick={() => navigate(CREATE_ACCOUNT)}>
          {t("create_wallet")}
        </Button>
        <Button classname="w-full" onClick={() => navigate(IMPORT_ACCOUNT)}>
          {t("import_wallet")}
        </Button>
      </div>


    </AccountFormWrapper>
  );
};
