import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BsChevronRight } from "react-icons/bs";
import { PageWrapper } from "../../components/common/PageWrapper";
import { OptionButton } from "./OptionButton";
import { CREATE_ACCOUNT, IMPORT_ACCOUNT } from "@src/routes/paths";

export const AddAccount = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("add_account");

  return (
    <PageWrapper>
      <div className="mb-14">
        <p className="font-medium text-2xl">{t("title")}</p>
      </div>
      <div className="flex flex-col gap-8">
        <OptionButton onClick={() => navigate(IMPORT_ACCOUNT)}>
          <p className="font-normal text-xl">{t("import_wallet")}</p>
          <BsChevronRight size={24} />
        </OptionButton>
        <OptionButton onClick={() => navigate(CREATE_ACCOUNT)}>
          <p className="font-normal text-xl">{t("create_wallet")}</p>
          <BsChevronRight size={24} />
        </OptionButton>
      </div>
    </PageWrapper>
  );
};
