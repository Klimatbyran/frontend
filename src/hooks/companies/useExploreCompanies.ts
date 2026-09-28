import { useQuery } from "@tanstack/react-query";
import { getExploreCompaniesPage } from "@/lib/api";
import { mapExploreCompany } from "@/lib/page-mappers";
import type { RankedCompany } from "@/types/company";

const STALE_TIME = 1800000;

export function useExploreCompanies(options?: { enabled?: boolean }) {
  const {
    data: companies = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pages", "explore", "companies"],
    queryFn: getExploreCompaniesPage,
    enabled: options?.enabled ?? true,
    staleTime: STALE_TIME,
    select: (data): RankedCompany[] => data.items.map(mapExploreCompany),
  });

  return {
    companies,
    companiesLoading: isLoading,
    companiesError: error,
  };
}
