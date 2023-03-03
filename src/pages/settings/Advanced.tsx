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
import { SettingKey } from "@src/storage/entities/settings/types";
import { BsPlus } from "react-icons/bs";
import { SETTINGS_MANAGE_NETWORKS } from "@src/routes/paths";

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
      showErrorToast(tCommon(error as string));
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
        switch (setting.name) {
          case SettingKey.MANAGE_NETWORKS:
            return (
              <div
                key={index}
                className="flex justify-between items-center gap-2"
              >
                <p className="text-lg font-medium">{t(setting.name)}</p>
                <button
                  type="button"
                  className="mt-5 inline-flex justify-between items-center rounded-md border border-transparent bg-custom-green-bg px-4 py-2 text-sm font-medium"
                  onClick={() => navigate(SETTINGS_MANAGE_NETWORKS)}
                >
                  <span>{tCommon('manage')} </span>
                  <BsPlus size={ICON_SIZE} />
                </button>
              </div>
            );
        }
      })}
    </PageWrapper>
  );
};
