import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { LocalizedLink } from "../../LocalizedLink";
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
      className={cn("w-full", className)}
      onClick={onNavigate}
    >
      {t(sublink.label)}
    </LocalizedLink>
  );
}
