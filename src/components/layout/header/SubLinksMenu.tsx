import { NavSubGroupSection } from "./NavSubGroupSection";
import { NavSubLinkItem } from "./NavSubLinkItem";
import { NAV_TITLE_CLASS } from "./navStyles";
import { isNavSubGroup, NavSubItem } from "./types";

export function SubLinksMenu({
  sublinks,
  onNavigate,
}: {
  sublinks: NavSubItem[];
  onNavigate?: () => void;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {sublinks.map((item) =>
        isNavSubGroup(item) ? (
          <li key={item.label}>
            <NavSubGroupSection group={item} onNavigate={onNavigate} />
          </li>
        ) : (
          <li key={item.path}>
            <NavSubLinkItem
              sublink={item}
              className={NAV_TITLE_CLASS}
              onNavigate={onNavigate}
            />
          </li>
        ),
      )}
    </ul>
  );
}
