import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { I18nextProvider } from "react-i18next";
import {
  detectLanguageFromPath,
  getLanguageUrl,
  SupportedLanguage,
} from "@/lib/languageDetection";

// Create context for language
interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  changeLanguage: (lang: SupportedLanguage) => void;
  getLocalizedPath: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: "sv",
  changeLanguage: () => {},
  getLocalizedPath: (path) => path,
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] =
    useState<SupportedLanguage>("sv");

  // Detect language from URL on initial load and route changes
  useEffect(() => {
    const pathLanguage = detectLanguageFromPath(location.pathname);
    if (pathLanguage && pathLanguage !== currentLanguage) {
      setCurrentLanguage(pathLanguage);
      i18n.changeLanguage(pathLanguage);
    }
  }, [location.pathname, i18n, currentLanguage]);

  // Change language and navigate to the localized URL
  const changeLanguage = (lang: SupportedLanguage) => {
    if (lang === currentLanguage) return;

    // Force language change in i18n first
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);

    // Preserve search parameters when changing language
    const newPath = getLanguageUrl(location.pathname, lang);
    navigate({ pathname: newPath, search: location.search }, { replace: true });
  };

  // Get localized path for a given route
  const getLocalizedPath = (path: string): string => {
    return getLanguageUrl(path, currentLanguage);
  };

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider
        value={{ currentLanguage, changeLanguage, getLocalizedPath }}
      >
        {children}
      </LanguageContext.Provider>
    </I18nextProvider>
  );
}
