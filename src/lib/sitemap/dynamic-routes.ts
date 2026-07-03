import { getCompanies, getMunicipalities } from "../api.js";
import { createSlug } from "../utils.js";
import type { SitemapEntry } from "./static-routes";

function getCompanyUrlSegment(company: {
  id: string;
  wikidataId?: string | null;
}): string {
  return company.wikidataId ?? company.id.split("-")[0];
}

async function fetchMunicipalityRoutes(
  currentDate: string,
): Promise<SitemapEntry[]> {
  const municipalities = await getMunicipalities();
  if (!municipalities || municipalities.length === 0) {
    return [];
  }

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

  const englishMunicipalityRoutes = municipalityRoutes.map((route) => ({
    ...route,
    loc: route.loc.replace(
      "https://klimatkollen.se/sv/municipalities/",
      "https://klimatkollen.se/en/municipalities/",
    ),
    priority: "0.5",
  }));

  return [...municipalityRoutes, ...englishMunicipalityRoutes];
}

async function fetchCompanyRoutes(currentDate: string): Promise<SitemapEntry[]> {
  const companies = await getCompanies();
  if (!companies || companies.length === 0) {
    return [];
  }

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

  return [...companyRoutes, ...englishCompanyRoutes];
}

export async function fetchDynamicRoutes(
  currentDate: string,
): Promise<{ routes: SitemapEntry[]; error?: unknown }> {
  try {
    const municipalityRoutes = await fetchMunicipalityRoutes(currentDate);
    const companyRoutes = await fetchCompanyRoutes(currentDate);
    return { routes: [...municipalityRoutes, ...companyRoutes] };
  } catch (error) {
    return { routes: [], error };
  }
}
