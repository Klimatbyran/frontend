import { LinkProps, Link as RouterLink } from "react-router-dom";
import { forwardRef } from "react";
import { useLanguage } from "./LanguageProvider";
import { localizedPath } from "@/utils/routing";

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
