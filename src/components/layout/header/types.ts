import type { ReactElement } from "react";

export interface NavSubLink {
  label: string;
  path: string;
  shortcut?: string;
  onlyShowOnStaging?: boolean;
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
}

export function isNavSubGroup(item: NavSubItem): item is NavSubGroup {
  return "items" in item;
}
