import { isNavSubGroup, NavLink, NavSubItem } from "./types";

export type NavTarget = "desktop" | "mobile";

function filterNavSubItem(
  item: NavSubItem,
  isStaging: boolean,
  target: NavTarget,
): NavSubItem | null {
  if (isNavSubGroup(item)) {
    const items = item.items.filter(
      (sublink) => !sublink.onlyShowOnStaging || isStaging,
    );
    return items.length > 0 ? { ...item, items } : null;
  }

  if (item.onlyShowOnStaging && !isStaging) {
    return null;
  }

  if (target === "desktop" && item.mobileOnly) {
    return null;
  }

  return item;
}

function filterNavSublinks(
  sublinks: NavSubItem[],
  isStaging: boolean,
  target: NavTarget,
): NavSubItem[] {
  return sublinks
    .map((item) => filterNavSubItem(item, isStaging, target))
    .filter((item): item is NavSubItem => item !== null);
}

export function getFilteredNavLinks(
  navLinks: NavLink[],
  isStaging: boolean,
  target: NavTarget = "desktop",
): NavLink[] {
  return navLinks
    .filter((link) => {
      if (link.onlyShowOnStaging && !isStaging) {
        return false;
      }

      if (target === "mobile" && link.desktopOnly) {
        return false;
      }

      return true;
    })
    .map((link) => {
      if (link.sublinks) {
        return {
          ...link,
          sublinks: filterNavSublinks(link.sublinks, isStaging, target),
        };
      }
      return link;
    });
}
