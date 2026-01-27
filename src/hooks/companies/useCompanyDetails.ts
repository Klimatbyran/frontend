import { useQuery } from "@tanstack/react-query";
import { getCompanyDetails } from "@/lib/api";
import { cleanEmissions } from "@/utils/data/cleaning";

export function useCompanyDetails(id: string) {
  const {
    data: company,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["company", id],
    queryFn: () => getCompanyDetails(id),
    enabled: !!id,
    staleTime: 1800000,
  });

  return {
    company: company
      ? {
          ...company,
          reportingPeriods: company.reportingPeriods.map((period) => ({
            ...period,
            emissions: cleanEmissions(period.emissions),
          })),
        }
      : undefined,
    loading: isLoading,
    error,
    refetch,
  };
}
