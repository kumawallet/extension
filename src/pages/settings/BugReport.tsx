import { ICON_SIZE } from "@src/constants/icons";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@src/components/common/PageWrapper";
import { useTranslation } from "react-i18next";
import { issuesLinks } from "@src/utils/constants";

export const BugReport = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("bug_report");

  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-10">
        <FiChevronLeft
          className="cursor-pointer"
          size={ICON_SIZE}
          onClick={() => navigate(-1)}
        />
        <p className="font-medium text-2xl">{t("title")}</p>
      </div>
      <div className="mb-10">
        <p className="text-xl font-medium mb-4">{t("collaborate")}</p>
        <p className="text-gray-500 mb-2">{t("collaborate_description")}</p>
        <a
          href={issuesLinks.github}
          className="text-blue-500 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          {t("collaborate_link")}
        </a>
      </div>
      <div>
        <p className="text-xl font-medium mb-4">{t("report_an_issue")}</p>
        <p className="text-gray-500 mb-2">{t("report_an_issue_description")}</p>
        <a
          href={issuesLinks.discord}
          className="text-blue-500 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          {t("report_an_issue_link")}
        </a>
      </div>
    </PageWrapper>
  );
};
