import { localizedPath } from "@/utils/routing";
import { isNavSubGroup, NavLink, NavSubItem } from "./types";

function stripQuery(path: string): string {
  const queryIndex = path.indexOf("?");
  return queryIndex >= 0 ? path.slice(0, queryIndex) : path;
}

export function isPathActive(
  pathname: string,
  lang: string,
  path: string,
): boolean {
  if (path.startsWith("https://")) {
    return false;
  }

  const normalizedPath = stripQuery(path);
  const fullPath = localizedPath(lang, normalizedPath);

  return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
}

function collectNavPaths(item: NavLink): string[] {
  const paths = [item.path];

  item.sublinks?.forEach((subitem: NavSubItem) => {
    if (isNavSubGroup(subitem)) {
      if (subitem.path) {
        paths.push(subitem.path);
      }
      subitem.items.forEach((sublink) => paths.push(sublink.path));
      return;
    }

    paths.push(subitem.path);
  });

  return paths;
}

export function isNavLinkActive(
  pathname: string,
  lang: string,
  item: NavLink,
): boolean {
  return collectNavPaths(item).some((path) =>
    isPathActive(pathname, lang, path),
  );
}
