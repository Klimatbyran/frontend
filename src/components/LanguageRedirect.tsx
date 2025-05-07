import { Navigate, useLocation } from "react-router-dom";
import { useLanguage } from "./LanguageProvider";

export function LanguageRedirect() {
  const location = useLocation();
  const { currentLanguage } = useLanguage();

  if (location.pathname === "/license") {
    return null;
  }

  // Check if the path already has a language prefix
  const hasLanguagePrefix = /^\/(en|sv)($|\/)/.test(location.pathname);

  // If it doesn't have a prefix, add the current language prefix
  if (!hasLanguagePrefix) {
    const targetPath = `/${currentLanguage}${location.pathname}`;
    return <Navigate to={targetPath} replace />;
  }

  // If it already has a prefix, don't redirect
  return null;
}
