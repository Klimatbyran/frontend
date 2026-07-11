import {
  createEnglishStaticRoutes,
  createSwedishStaticRoutes,
} from "./static-route-definitions";

export interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

export function createStaticRoutes(currentDate: string): SitemapEntry[] {
  return [
    ...createSwedishStaticRoutes(currentDate),
    ...createEnglishStaticRoutes(currentDate),
  ];
}
