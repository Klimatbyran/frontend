import { LinkProps, Link as RouterLink } from "react-router-dom";
import { forwardRef } from "react";
import { localizedPath } from "@/utils/routing";
import { useLanguage } from "./LanguageProvider";

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
