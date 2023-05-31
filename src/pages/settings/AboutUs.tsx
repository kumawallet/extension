import { ICON_SIZE } from "@src/constants/icons";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@src/components/common/PageWrapper";
import { useTranslation } from "react-i18next";

export const AboutUs = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("settings");

  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-10">
        <FiChevronLeft
          className="cursor-pointer"
          size={ICON_SIZE}
          onClick={() => navigate(-1)}
        />
        <p className="font-medium text-2xl">{t("about_us")}</p>
      </div>
    </PageWrapper>
  );
};
