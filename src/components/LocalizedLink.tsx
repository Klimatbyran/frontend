import { LinkProps, Link as RouterLink, To } from "react-router-dom";
import { useLanguage } from "./LanguageProvider";

export const localizedPath = (lang: string, path: To) => `/${lang}${path}`;

export const LocalizedLink = ({
  lang,
  to,
  ...props
}: { lang?: string } & LinkProps) => {
  const { currentLanguage } = useLanguage();

  return (
    <RouterLink to={localizedPath(lang ?? currentLanguage, to)} {...props} />
  );
};
