import { useQuery } from "@tanstack/react-query";
import { getCompaniesOverviewPage } from "@/lib/api";
import { mapCompaniesOverviewItem } from "@/lib/page-mappers";
import type { RankedCompany } from "@/types/company";

const STALE_TIME = 1800000;

export function useCompaniesOverview(options?: { enabled?: boolean }) {
  const {
    data: companies = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pages", "companies-overview"],
    queryFn: getCompaniesOverviewPage,
    enabled: options?.enabled ?? true,
    staleTime: STALE_TIME,
    select: (data): RankedCompany[] => data.map(mapCompaniesOverviewItem),
  });

  return {
    companies,
    companiesLoading: isLoading,
    companiesError: error,
  };
}
