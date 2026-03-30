import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import hi from "./locales/hi.json";
import ta from "./locales/ta.json";

const DEFAULT_LANGUAGE = "en";
const resources = {
  en: { translation: en },
  hi: { translation: hi },
  ta: { translation: ta }
};

const getInitialLanguage = () => {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.localStorage.getItem("builtyos_language") || undefined;
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: Object.keys(resources),
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "builtyos_language"
    }
  });

export default i18n;
