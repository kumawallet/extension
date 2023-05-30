import LanguageDetector from "i18next-browser-languagedetector";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en, es, jp, it } from "../i18n";

const DEFAULT_LANGUAGE = "en";

const storedLanguage = localStorage.getItem("language") || DEFAULT_LANGUAGE;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en,
      es,
      jp,
      it
    },
    lng: storedLanguage,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false,
      skipOnVariables: false,
    },
  });

export default i18n;
