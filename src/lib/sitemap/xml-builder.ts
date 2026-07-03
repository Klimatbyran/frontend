import type { SitemapEntry } from "./static-routes";

function buildAlternateLinks(route: SitemapEntry): string {
  if (!route.loc.includes("/en/")) {
    const enUrl = route.loc.replace(
      "https://klimatkollen.se/sv/",
      "https://klimatkollen.se/en/",
    );
    return `
    <xhtml:link rel="alternate" hreflang="sv" href="${route.loc}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${route.loc}" />`;
  }

  const svUrl = route.loc.replace(
    "https://klimatkollen.se/en/",
    "https://klimatkollen.se/sv/",
  );
  return `
    <xhtml:link rel="alternate" hreflang="sv" href="${svUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${route.loc}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${svUrl}" />`;
}

function buildUrlEntry(route: SitemapEntry): string {
  const alternateLinks = buildAlternateLinks(route);
  return `  <url>
    <loc>${route.loc}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>${alternateLinks}
  </url>`;
}

export function buildSitemapXml(routes: SitemapEntry[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${routes.map(buildUrlEntry).join("\n")}
</urlset>`;
}
