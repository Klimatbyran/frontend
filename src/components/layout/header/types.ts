import type { ReactElement } from "react";

export interface NavSubLink {
  label: string;
  path: string;
  shortcut?: string;
  onlyShowOnStaging?: boolean;
  /** Shown in mobile menu only (e.g. duplicate of a desktop-only top-level link). */
  mobileOnly?: boolean;
}

export interface NavSubGroup {
  label: string;
  path?: string;
  items: NavSubLink[];
}

export type NavSubItem = NavSubLink | NavSubGroup;

export interface NavLink {
  label: string;
  icon?: ReactElement;
  path: string;
  sublinks?: NavSubItem[];
  onlyShowOnStaging?: boolean;
  /** Shown in desktop header only (not the mobile hamburger menu). */
  desktopOnly?: boolean;
}

export function isNavSubGroup(item: NavSubItem): item is NavSubGroup {
  return "items" in item;
}
