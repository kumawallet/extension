import { ICON_SIZE } from "@src/constants/icons";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@src/components/common/PageWrapper";
import { useTranslation } from "react-i18next";
import { issuesLinks } from "@src/utils/constants";
import { FaGithub, FaDiscord } from "react-icons/fa";

export const BugReport = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("bug_report");

  return (
    <PageWrapper>
      <div className="flex items-center mb-10">
        <FiChevronLeft
          className="cursor-pointer"
          size={ICON_SIZE}
          onClick={() => navigate(-1)}
        />
        <p className="font-medium text-base">{t("title")}</p>
      </div>
      <div className=" m-4">
        <div className="mb-10">
          <p className="text-base font-medium mb-4">{t("collaborate")}</p>
          <p className="text-white-500 mb-4">{t("collaborate_description")}</p>
          <a
            href={issuesLinks.github as unknown as string}
            className="flex items-center text-blue-500 hover:underline gap-2"
            target="_blank"
            rel="noreferrer"
          >
            <FaGithub className="text-white" />
            <span>

              {t("collaborate_link")}
            </span>
          </a>
        </div>
        <div>
          <p className="text-base font-medium mb-4">{t("report_an_issue")}</p>
          <p className="text-white-500 mb-4">{t("report_an_issue_description")}</p>
          <a
            href={issuesLinks.discord as unknown as string}
            className="text-blue-500 hover:underline flex items-center gap-2"
            target="_blank"
            rel="noreferrer"
          >
            <FaDiscord className="" />
            <span>
              {t("report_an_issue_link")}
            </span>
          </a>
        </div>
      </div>
    </PageWrapper>
  );
};
