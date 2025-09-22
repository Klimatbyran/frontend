// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// TODO: These should be lazy loaded instead
import en from "./locales/en/translation.json";
import sv from "./locales/sv/translation.json";
import enDataGuideItems from "./locales/en/dataguideItems.json";
import svDataGuideItems from "./locales/sv/dataguideItems.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
        dataguideItems: enDataGuideItems,
      },
      sv: {
        translation: sv,
        dataguideItems: svDataGuideItems,
      },
    },
    lng: "sv",
    fallbackLng: "sv",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
