import { useQuery } from "@tanstack/react-query";
import { getSectorsPage } from "@/lib/api";
import { mapSectorCompany } from "@/lib/page-mappers";
import type { RankedCompany } from "@/types/company";

const STALE_TIME = 1800000;

export function useSectorCompanies(options?: { enabled?: boolean }) {
  const {
    data: companies = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pages", "sectors"],
    queryFn: getSectorsPage,
    enabled: options?.enabled ?? true,
    staleTime: STALE_TIME,
    select: (data): RankedCompany[] => data.map(mapSectorCompany),
  });

  return {
    companies,
    companiesLoading: isLoading,
    companiesError: error,
  };
}
