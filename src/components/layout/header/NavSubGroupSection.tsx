import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { NavSubLinkItem } from "./NavSubLinkItem";
import { NAV_SUB_ITEM_CLASS, NAV_TITLE_CLASS } from "./navStyles";
import { NavSubGroup } from "./types";

export function NavSubGroupSection({
  group,
  onNavigate,
}: {
  group: NavSubGroup;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      {group.path ? (
        <NavSubLinkItem
          sublink={{ label: group.label, path: group.path }}
          className={NAV_TITLE_CLASS}
          onNavigate={onNavigate}
        />
      ) : (
        <span className={cn(NAV_TITLE_CLASS, "hover:bg-transparent")}>
          {t(group.label)}
        </span>
      )}
      <ul className="flex flex-col pl-3">
        {group.items.map((sublink) => (
          <li
            key={sublink.path}
            className="group/sub flex items-center gap-2 rounded-md pl-1 hover:bg-black-1"
          >
            <span
              className="text-grey group-hover/sub:text-white select-none transition-colors"
              aria-hidden="true"
            >
              –
            </span>
            <NavSubLinkItem
              sublink={sublink}
              className={cn(
                NAV_SUB_ITEM_CLASS,
                "hover:bg-transparent group-hover/sub:text-white",
              )}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
