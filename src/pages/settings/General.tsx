import { ICON_SIZE } from "@src/constants/icons";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@src/components/common/PageWrapper";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import Extension from "@src/Extension";
import { useToast } from "@src/hooks";
import Setting from "@src/storage/entities/settings/Setting";
import {
  Language,
  SettingKey,
  SettingType,
} from "@src/storage/entities/settings/types";
import { Loading } from "@src/components/common";
import { BsGear } from "react-icons/bs";
import { SETTINGS_MANAGE_NETWORKS } from "@src/routes/paths";
import { Switch } from "@headlessui/react";
import { captureError } from "@src/utils/error-handling";
import { useThemeContext } from "@src/providers";

export const General = () => {
  const { t, i18n } = useTranslation("general_settings");
  const { t: tCommon, i18n: i18nCommon } = useTranslation("common");
  const { color } = useThemeContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState([] as Setting[]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [showTestnets, setShowTestnets] = useState(false);
  const { showErrorToast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    getSettings();
  }, []);

  const getSettings = async () => {
    try {
      const settings = await Extension.getGeneralSettings();
      setSettings(settings);
      const laguagesSetting = getSettingByName(settings, SettingKey.LANGUAGES)
        ?.value as Language[];
      const showTestnetsSetting = getSettingByName(
        settings,
        SettingKey.SHOW_TESTNETS
      )?.value as boolean;
      setSelectedLanguage(getSelectedLanguage(laguagesSetting));
      setShowTestnets(showTestnetsSetting);
    } catch (error) {
      setSettings([]);
      captureError(error);
      showErrorToast(tCommon("failed_to_get_settings"));
    } finally {
      setIsLoading(false);
    }
  };

  const getSettingByName = (settings: Setting[], name: SettingKey) => {
    if (!settings) return undefined;
    return settings.find((setting) => setting.name === name);
  };

  const getSelectedLanguage = (languages: Language[]) => {
    const selectedLanguage = languages.find(
      (language) => language.lang === localStorage.getItem("language")
    );
    return selectedLanguage?.lang || "en";
  };

  const saveLanguage = async (language: string) => {
    try {
      await localStorage.setItem("language", language || "en");
      setSelectedLanguage(language);
      i18n.changeLanguage(language || "en");
      i18nCommon.changeLanguage(language || "en");
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon("failed_to_update_setting"));
    }
  };

  const changeShowTestnets = async () => {
    try {
      const showTestnetsSetting = settings.find(
        (setting) => setting.name === SettingKey.SHOW_TESTNETS
      );
      if (showTestnetsSetting) {
        settings[settings.indexOf(showTestnetsSetting)].value = !showTestnets;
        setShowTestnets(!showTestnets);
        await Extension.updateSetting(
          SettingType.GENERAL,
          SettingKey.SHOW_TESTNETS,
          !showTestnets
        );
      }
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon("failed_to_update_setting"));
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
      <div className="flex flex-col gap-5">
        {settings.map((setting, index) => {
          switch (setting.name) {
            case SettingKey.LANGUAGES:
              return (
                <div key={index} className="flex flex-col gap-2">
                  <p className="text-lg font-medium">{t(setting.name)}</p>
                  <select
                    data-testid="language-select"
                    className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                    onChange={(e) => saveLanguage(e.target.value)}
                    value={selectedLanguage}
                  >
                    {setting.isLanguageArray() &&
                      (setting.value as Language[]).map((option, index) => (
                        <option key={index} value={option.lang}>
                          {`${option.name} (${option.englishName})`}
                        </option>
                      ))}
                  </select>
                </div>
              );
            case SettingKey.MANAGE_NETWORKS:
              return (
                <div
                  key={index}
                  className="flex justify-between items-center gap-2"
                >
                  <p className="text-lg font-medium">{t(setting.name)}</p>
                  <button
                    data-testid="manage-networks-button"
                    type="button"
                    className="inline-flex justify-between items-center cursor-pointer rounded-md border border-transparent hover:bg-gray-400 hover:bg-opacity-30 px-4 py-2 text-sm font-medium"
                    onClick={() => navigate(SETTINGS_MANAGE_NETWORKS)}
                  >
                    <BsGear color="white" size={ICON_SIZE} />
                  </button>
                </div>
              );
            case SettingKey.SHOW_TESTNETS:
              return (
                <div
                  key={index}
                  className="flex justify-between items-center gap-2"
                >
                  <p className="text-lg font-medium">{t(setting.name)}</p>
                  <div className="flex items-center justify-end">
                    <Switch.Group>
                      <div className="flex items-center">
                        <Switch
                          data-testid="show-testnets-switch"
                          checked={showTestnets}
                          onChange={changeShowTestnets}
                          className={`${
                            showTestnets
                              ? `bg-${color}-primary`
                              : "bg-custom-gray-bg"
                          } relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200`}
                        >
                          <span className="sr-only">{t("show_testnets")}</span>
                          <span
                            className={`${
                              showTestnets ? "translate-x-6" : "translate-x-1"
                            } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200`}
                          />
                        </Switch>
                      </div>
                    </Switch.Group>
                  </div>
                </div>
              );
          }
        })}
      </div>
    </PageWrapper>
  );
};
