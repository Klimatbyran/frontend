import { useQuery } from "@tanstack/react-query";
import { getCompanyParisOverview } from "@/lib/api";
import { mapParisOverviewToCompanyWithKPIs } from "@/types/companyParisOverview";
import type { CompanyWithKPIs } from "@/types/company";

interface UseCompanyParisOverviewResult {
  companies: CompanyWithKPIs[];
  companiesLoading: boolean;
  companiesError: Error | null;
}

export function useCompanyParisOverview(options?: {
  enabled?: boolean;
}): UseCompanyParisOverviewResult {
  const {
    data: companies = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["companies", "paris-overview"],
    queryFn: getCompanyParisOverview,
    enabled: options?.enabled ?? true,
    staleTime: 1800000,
    select: (data) => data.map(mapParisOverviewToCompanyWithKPIs),
  });

  return {
    companies,
    companiesLoading: isLoading,
    companiesError: error,
  };
}
