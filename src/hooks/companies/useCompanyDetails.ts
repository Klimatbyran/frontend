import { useQuery } from "@tanstack/react-query";
import { getCompanyDetails } from "@/lib/api";
import { cleanEmissions } from "@/utils/cleanEmissions";

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
