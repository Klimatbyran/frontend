import { useQuery } from "@tanstack/react-query";
import { getCompaniesKPIs } from "@/lib/api";
import { enrichCompanyWithKPIs } from "@/hooks/companies/useCompanyKPIs";
import type {
  CompanyKpiData,
  CompanyWithKPIs,
  RankedCompany,
} from "@/types/company";

export type { CompanyKpiData } from "@/types/company";

/** Fetches company KPIs from `/companies/kpis` (overview). */
export function useCompaniesKPIs(options?: { enabled?: boolean }) {
  const {
    data: companiesKpiData = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["companies-kpis"],
    queryFn: getCompaniesKPIs,
    enabled: options?.enabled ?? true,
    staleTime: 1800000,
  });

  return {
    companiesKpiData,
    loading: isLoading,
    error,
  };
}

export function buildCompanyKpiLookup(
  companiesKpiData: CompanyKpiData[],
): Map<string, CompanyKpiData> {
  return new Map(companiesKpiData.map((kpi) => [kpi.wikidataId, kpi]));
}

/** Merge API KPI values onto a ranked company. Falls back to client calc. */
export function mergeApiKpisOntoCompany(
  company: RankedCompany,
  kpiLookup: Map<string, CompanyKpiData>,
): CompanyWithKPIs {
  const kpi = kpiLookup.get(company.wikidataId);
  if (!kpi) {
    return enrichCompanyWithKPIs(company);
  }

  return {
    ...company,
    meetsParis: kpi.meetsParis ?? null,
    emissionsChangeFromBaseYear: kpi.emissionsChangeFromBaseYear ?? null,
  };
}

export function applyCompanyKpis(
  companies: RankedCompany[],
  companiesKpiData: CompanyKpiData[],
): CompanyWithKPIs[] {
  if (companiesKpiData.length === 0) {
    return companies.map((company) => enrichCompanyWithKPIs(company));
  }

  const kpiLookup = buildCompanyKpiLookup(companiesKpiData);
  return companies.map((company) =>
    mergeApiKpisOntoCompany(company, kpiLookup),
  );
}
