import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "../../LanguageProvider";
import { LocalizedLink } from "../../LocalizedLink";
import { isPathActive } from "./navActive";
import { NAV_ITEM_ACTIVE_CLASS } from "./navStyles";
import { NavSubLink } from "./types";

export function NavSubLinkItem({
  sublink,
  className,
  onNavigate,
}: {
  sublink: NavSubLink;
  className?: string;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const location = useLocation();
  const { currentLanguage } = useLanguage();
  const isActive = isPathActive(
    location.pathname,
    currentLanguage,
    sublink.path,
  );

  if (sublink.path.startsWith("https://")) {
    return (
      <a
        href={sublink.path}
        className={cn("w-full", className)}
        target="_blank"
        rel="noreferrer"
        onClick={onNavigate}
      >
        {t(sublink.label)}
      </a>
    );
  }

  return (
    <LocalizedLink
      to={sublink.path}
      className={cn("w-full", className, isActive && NAV_ITEM_ACTIVE_CLASS)}
      aria-current={isActive ? "page" : undefined}
      onClick={onNavigate}
    >
      {t(sublink.label)}
    </LocalizedLink>
  );
}
