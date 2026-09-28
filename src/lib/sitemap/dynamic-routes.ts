import { getSitemapPage } from "../api.js";
import { createSlug } from "../utils.js";
import type { SitemapEntry } from "./static-routes";

function getCompanyUrlSegment(company: {
  id: string;
  wikidataId?: string | null;
}): string {
  return company.wikidataId ?? company.id.split("-")[0];
}

function withEnglishRoutes(
  routes: SitemapEntry[],
  swedishPrefix: string,
  englishPrefix: string,
  englishPriority: string,
): SitemapEntry[] {
  return routes.map((route) => ({
    ...route,
    loc: route.loc.replace(swedishPrefix, englishPrefix),
    priority: englishPriority,
  }));
}

async function fetchSitemapEntries(
  currentDate: string,
): Promise<SitemapEntry[]> {
  const sitemap = await getSitemapPage();
  const municipalities = sitemap.municipalities ?? [];
  const companies = sitemap.companies ?? [];
  const regions = sitemap.regions ?? [];

  const municipalityRoutes = municipalities
    .filter((municipality) => municipality.name)
    .map((municipality) => {
      const id = createSlug(municipality.name);
      return {
        loc: `https://klimatkollen.se/sv/municipalities/${id}`,
        lastmod: currentDate,
        changefreq: "monthly",
        priority: "0.6",
      };
    });

  const companyRoutes = companies.map((company) => {
    const slug = createSlug(company.name);
    return {
      loc: `https://klimatkollen.se/sv/foretag/${slug}-${getCompanyUrlSegment(company)}`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: "0.6",
    };
  });

  const englishCompanyRoutes = companies.map((company) => {
    const slug = createSlug(company.name);
    return {
      loc: `https://klimatkollen.se/en/companies/${getCompanyUrlSegment(company)}/${slug}`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: "0.5",
    };
  });

  const regionRoutes = regions
    .filter((region) => region.name)
    .map((region) => ({
      loc: `https://klimatkollen.se/sv/regions/${encodeURI(region.name.toLowerCase())}`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: "0.6",
    }));

  return [
    ...municipalityRoutes,
    ...withEnglishRoutes(
      municipalityRoutes,
      "https://klimatkollen.se/sv/municipalities/",
      "https://klimatkollen.se/en/municipalities/",
      "0.5",
    ),
    ...companyRoutes,
    ...englishCompanyRoutes,
    ...regionRoutes,
    ...withEnglishRoutes(
      regionRoutes,
      "https://klimatkollen.se/sv/regions/",
      "https://klimatkollen.se/en/regions/",
      "0.5",
    ),
  ];
}

export async function fetchDynamicRoutes(
  currentDate: string,
): Promise<{ routes: SitemapEntry[]; error?: unknown }> {
  try {
    const routes = await fetchSitemapEntries(currentDate);
    return { routes };
  } catch (error) {
    return { routes: [], error };
  }
}
