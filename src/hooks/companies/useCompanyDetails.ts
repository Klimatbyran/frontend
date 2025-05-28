import { useQuery } from "@tanstack/react-query";
import { getCompanyDetails } from "@/lib/api";
import type { paths } from "@/lib/api-types";
import { cleanEmissions } from "@/utils/cleanEmissions";

type CompanyDetails = NonNullable<
  paths["/companies/{wikidataId}"]["get"]["responses"][200]["content"]["application/json"]
>;

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
