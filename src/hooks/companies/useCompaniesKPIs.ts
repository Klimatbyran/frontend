import { useQuery } from "@tanstack/react-query";
import { getCompaniesKPIs } from "@/lib/api";
import type {
  CompanyKpiData,
  CompanyWithKPIs,
  RankedCompany,
} from "@/types/company";

export type { CompanyKpiData } from "@/types/company";

/** Fetches company KPIs from `/companies/kpis` (overview / landing). */
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

/** Merge API KPI values onto a ranked company (replaces client-side KPI calculation). */
export function mergeApiKpisOntoCompany(
  company: RankedCompany,
  kpiLookup: Map<string, CompanyKpiData>,
): CompanyWithKPIs {
  const kpi = kpiLookup.get(company.wikidataId);

  return {
    ...company,
    meetsParis: kpi?.meetsParis ?? null,
    emissionsChangeFromBaseYear: kpi?.emissionsChangeFromBaseYear ?? null,
  };
}
