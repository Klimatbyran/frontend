import { isNavSubGroup, NavLink, NavSubItem } from "./types";

function filterNavSubItem(
  item: NavSubItem,
  isStaging: boolean,
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

  return item;
}

function filterNavSublinks(
  sublinks: NavSubItem[],
  isStaging: boolean,
): NavSubItem[] {
  return sublinks
    .map((item) => filterNavSubItem(item, isStaging))
    .filter((item): item is NavSubItem => item !== null);
}

export function getFilteredNavLinks(
  navLinks: NavLink[],
  isStaging: boolean,
): NavLink[] {
  return navLinks
    .filter((link) => !link.onlyShowOnStaging || isStaging)
    .map((link) => {
      if (link.sublinks) {
        return {
          ...link,
          sublinks: filterNavSublinks(link.sublinks, isStaging),
        };
      }
      return link;
    });
}
