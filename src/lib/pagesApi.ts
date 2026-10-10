import { apiUrl } from "./api";
import type {
  PageCompaniesOverviewQuery,
  PageCompaniesOverviewSummary,
  PageCompanyEmissionsHistory,
  PageCompanyHeader,
  PageCompanyOverview,
  PageCompanyOverviewItem,
  PageCompanyScope3,
  PageCompanyTurnoverHistory,
  PageExploreCompany,
  PageLanding,
  PageListResponse,
  PageSitemap,
} from "@/types/pages";

function withServerApiKey(init?: RequestInit): RequestInit {
  const apiKey =
    typeof process !== "undefined"
      ? process.env.GARBO_ALL_ACCESS_API_KEY
      : undefined;
  if (typeof window !== "undefined" || !apiKey) {
    return init ?? {};
  }
  const headers = new Headers(init?.headers);
  headers.set("X-API-Key", apiKey);
  return { ...init, headers };
}

async function fetchPageJson<T>(path: string): Promise<T> {
  const response = await fetch(apiUrl(path), withServerApiKey());
  if (!response.ok) {
    throw new Error(`Pages API ${path} failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

function toQuery(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function getPageLanding(): Promise<PageLanding> {
  return fetchPageJson("/pages/landing");
}

export async function getPageCompaniesOverview(
  query: PageCompaniesOverviewQuery = {},
): Promise<PageListResponse<PageCompanyOverviewItem>> {
  return fetchPageJson(
    `/pages/companies-overview${toQuery({
      sector: query.sector,
      q: query.q,
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      page: query.page,
      pageSize: query.pageSize,
    })}`,
  );
}

export async function getPageCompaniesOverviewSummary(
  sector?: string | null,
): Promise<PageCompaniesOverviewSummary> {
  return fetchPageJson(
    `/pages/companies-overview/summary${toQuery({ sector })}`,
  );
}

export async function getPageExploreCompanies(query?: {
  page?: number;
  pageSize?: number;
}): Promise<PageListResponse<PageExploreCompany>> {
  return fetchPageJson(
    `/pages/explore/companies${toQuery({
      page: query?.page,
      pageSize: query?.pageSize,
    })}`,
  );
}

export async function getPageSitemap(): Promise<PageSitemap> {
  return fetchPageJson("/pages/sitemap");
}

export async function getPageCompanyHeader(
  id: string,
): Promise<PageCompanyHeader> {
  return fetchPageJson(`/pages/company/${encodeURIComponent(id)}`);
}

export async function getPageCompanyOverview(
  id: string,
  year?: number,
): Promise<PageCompanyOverview> {
  return fetchPageJson(
    `/pages/company/${encodeURIComponent(id)}/overview${toQuery({ year })}`,
  );
}

export async function getPageCompanyEmissionsHistory(
  id: string,
): Promise<PageCompanyEmissionsHistory> {
  return fetchPageJson(
    `/pages/company/${encodeURIComponent(id)}/emissions-history`,
  );
}

export async function getPageCompanyTurnoverHistory(
  id: string,
): Promise<PageCompanyTurnoverHistory> {
  return fetchPageJson(
    `/pages/company/${encodeURIComponent(id)}/turnover-history`,
  );
}

export async function getPageCompanyScope3(
  id: string,
  year?: number,
): Promise<PageCompanyScope3> {
  return fetchPageJson(
    `/pages/company/${encodeURIComponent(id)}/scope3${toQuery({ year })}`,
  );
}
