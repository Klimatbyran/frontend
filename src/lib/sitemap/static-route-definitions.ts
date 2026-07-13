import type { SitemapEntry } from "./static-routes";

function createRoute(
  path: string,
  currentDate: string,
  changefreq: string,
  priority: string,
): SitemapEntry {
  return {
    loc: `https://klimatkollen.se${path}`,
    lastmod: currentDate,
    changefreq,
    priority,
  };
}

export function createSwedishStaticRoutes(currentDate: string): SitemapEntry[] {
  return [
    createRoute("/sv/", currentDate, "weekly", "1.0"),
    createRoute("/sv/municipalities", currentDate, "monthly", "0.8"),
    createRoute("/sv/companies", currentDate, "monthly", "0.8"),
    createRoute("/sv/sectors", currentDate, "monthly", "0.7"),
    createRoute("/sv/regions", currentDate, "monthly", "0.7"),
    createRoute("/sv/nation", currentDate, "monthly", "0.7"),
    createRoute("/sv/valet-2026", currentDate, "monthly", "0.7"),
    createRoute("/sv/about", currentDate, "monthly", "0.7"),
    createRoute("/sv/methodology", currentDate, "monthly", "0.6"),
    createRoute("/sv/support", currentDate, "monthly", "0.6"),
    createRoute("/sv/articles", currentDate, "weekly", "0.7"),
    createRoute("/sv/reports", currentDate, "weekly", "0.7"),
    createRoute("/sv/learn-more", currentDate, "monthly", "0.6"),
    createRoute("/sv/newsletter-archive", currentDate, "weekly", "0.5"),
    createRoute("/sv/privacy", currentDate, "yearly", "0.3"),
    createRoute("/sv/data-download", currentDate, "monthly", "0.6"),
    createRoute("/sv/insights/klimatmal", currentDate, "monthly", "0.6"),
    createRoute(
      "/sv/insights/utslappsberakning",
      currentDate,
      "monthly",
      "0.6",
    ),
  ];
}

export function createEnglishStaticRoutes(currentDate: string): SitemapEntry[] {
  return [
    createRoute("/en", currentDate, "weekly", "0.9"),
    createRoute("/en/municipalities", currentDate, "monthly", "0.7"),
    createRoute("/en/companies", currentDate, "monthly", "0.7"),
    createRoute("/en/sectors", currentDate, "monthly", "0.6"),
    createRoute("/en/regions", currentDate, "monthly", "0.6"),
    createRoute("/en/nation", currentDate, "monthly", "0.6"),
    createRoute("/en/valet-2026", currentDate, "monthly", "0.6"),
    createRoute("/en/about", currentDate, "monthly", "0.6"),
    createRoute("/en/methodology", currentDate, "monthly", "0.6"),
    createRoute("/en/support", currentDate, "monthly", "0.5"),
    createRoute("/en/articles", currentDate, "weekly", "0.6"),
    createRoute("/en/reports", currentDate, "weekly", "0.6"),
    createRoute("/en/learn-more", currentDate, "monthly", "0.5"),
    createRoute("/en/newsletter-archive", currentDate, "weekly", "0.4"),
    createRoute("/en/privacy", currentDate, "yearly", "0.3"),
    createRoute("/en/data-download", currentDate, "monthly", "0.5"),
    createRoute("/en/insights/klimatmal", currentDate, "monthly", "0.5"),
    createRoute(
      "/en/insights/utslappsberakning",
      currentDate,
      "monthly",
      "0.5",
    ),
  ];
}
