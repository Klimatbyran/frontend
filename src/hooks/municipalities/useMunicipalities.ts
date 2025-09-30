import { useQuery } from "@tanstack/react-query";
import { getMunicipalities } from "@/lib/api";
import type { paths } from "@/lib/api-types";

// Get municipality type from API types
type Municipality = NonNullable<
  paths["/municipalities/"]["get"]["responses"][200]["content"]["application/json"]
>[0];

interface UseMunicipalitiesReturn {
  municipalities: Municipality[];
  loading: boolean;
  error: unknown;
  getTopMunicipalities: (count?: number) => Municipality[];
}

export function useMunicipalities(): UseMunicipalitiesReturn {
  const {
    data: municipalities = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["municipalities"],
    queryFn: getMunicipalities,
    select: (data) => {
      return data.map((municipality) => ({
        ...municipality,
        meetsParisGoal: municipality.totalTrend <= municipality.totalCarbonLaw,
      }));
    },
  });

  // Get top municipalities by emissions reduction
  const getTopMunicipalities = (count: number = 5) => {
    return [...municipalities]
      .sort(
        (a, b) =>
          // Sort by historical emission change percent (negative is better)
          a.historicalEmissionChangePercent - b.historicalEmissionChangePercent,
      )
      .slice(0, count);
  };

  return {
    municipalities,
    loading: isLoading,
    error,
    getTopMunicipalities,
  };
}
