import { useQuery } from "@tanstack/react-query";
import { getMunicipalityDetails } from "@/lib/api";
import { Municipality } from "@/types/municipality";

export function useMunicipalityDetails(id: string) {
  const {
    data: municipality,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["municipality", id],
    queryFn: () => getMunicipalityDetails(id),
    enabled: !!id,
    staleTime: 1800000,
  });

  return {
    municipality: municipality
      ? ({
          ...municipality,
          meetsParisGoal:
            municipality.totalTrend <= municipality.totalCarbonLaw,
          climatePlan: municipality.climatePlanYear !== null,
        } as Municipality)
      : null,
    loading: isLoading,
    error,
  };
}
