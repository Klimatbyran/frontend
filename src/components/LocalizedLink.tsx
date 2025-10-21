import { LinkProps, Link as RouterLink, To } from "react-router-dom";
import { forwardRef } from "react";
import { useLanguage } from "./LanguageProvider";

export const localizedPath = (lang: string, path: To) => `/${lang}${path}`;

export const LocalizedLink = forwardRef<
  HTMLAnchorElement,
  { lang?: string } & LinkProps
>(({ lang, to, ...props }, ref) => {
  const { currentLanguage } = useLanguage();

  return (
    <RouterLink
      ref={ref}
      to={localizedPath(lang ?? currentLanguage, to)}
      {...props}
    />
  );
});
