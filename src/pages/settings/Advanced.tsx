import { ICON_SIZE } from "@src/constants/icons";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@src/components/common/PageWrapper";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import Extension from "@src/Extension";
import { useToast } from "@src/hooks";
import Setting from "@src/storage/entities/settings/Setting";
import { Loading } from "@src/components/common";
import { captureError } from "@src/utils/error-handling";

export const Advanced = () => {
  const { t } = useTranslation("advanced_settings");
  const { t: tCommon } = useTranslation("common");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState([] as Setting[]);
  const { showErrorToast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    getSettings();
  }, []);

  const getSettings = async () => {
    try {
      const settings = await Extension.getAdvancedSettings();
      setSettings(settings);
    } catch (error) {
      setSettings([]);
      captureError(error);
      showErrorToast(tCommon("failed_to_get_settings"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

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
      {settings.map((setting, index) => {
        return (
          <div key={index}>
            <p>{setting.name}</p>
          </div>
        );
      })}
    </PageWrapper>
  );
};
