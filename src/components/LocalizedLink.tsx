import { LinkProps, Link as RouterLink } from "react-router-dom";
import { useLanguage } from "./LanguageProvider";

export const LocalizedLink = ({
  lang,
  to,
  ...props
}: { lang?: string } & LinkProps) => {
  const { currentLanguage } = useLanguage();

  const localisedTo = `/${lang ?? currentLanguage}${to}`;

  return <RouterLink to={localisedTo} {...props} />;
};
