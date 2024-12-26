import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "../src/locales/en/translation.json";
import zh from "../src/locales/zh/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next) // Integrates i18n with React
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
    },
    fallbackLng: "en", // Fallback language if translation not found
    interpolation: {
      escapeValue: false, // React already handles XSS protection
    },
    detection: {
        order: ['localStorage', 'cookie', 'querystring', 'navigator'], // Detection order
        caches: ['localStorage', 'cookie'], // Cache the detected language
      },
  });

export default i18n;
