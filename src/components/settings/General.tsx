import { ICON_SIZE } from "@src/contants/icons";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "../common/PageWrapper";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import Extension from "@src/Extension";
import { useToast } from "@src/hooks";
import { Language, Setting } from "@src/storage/entities/Settings";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export const General = () => {
  const { t, i18n } = useTranslation("general_settings");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState([] as Setting[]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const { showErrorToast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    getSettings();
  }, []);

  const getSettings = async () => {
    try {
      const settings = await Extension.getGeneralSettings();
      setSettings(settings);
      setSelectedLanguage(getSelectedLanguage(settings[0].value as Language[]));
    } catch (error) {
      setSettings([]);
      showErrorToast(error);
    } finally {
      setIsLoading(false);
    }
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
      i18n.changeLanguage(language || "en")
    } catch (error) {
      showErrorToast(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-3">
        <AiOutlineLoading3Quarters className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" />
      </div>
    );
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
      {settings.map((setting, index) => (
        <div key={index} className="flex flex-col gap-2">
          <p className="text-lg font-medium">{t(setting.name)}</p>
          <select
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
      ))}
    </PageWrapper>
  );
};
