import { useQuery } from "@tanstack/react-query";
import { getMunicipalities } from "@/lib/api";
import type { paths } from "@/lib/api-types";
import { Municipality } from "@/types/municipality";

// Get municipality type from API types
type ApiMunicipality = NonNullable<
  paths["/municipalities/"]["get"]["responses"][200]["content"]["application/json"]
>[0];

interface IMunicipalitiesReturn {
  municipalities: Municipality[];
  municipalitiesLoading: boolean;
  municipalitiesError: any;
  getTopMunicipalities: (count?: number) => Municipality[];
}

export function useMunicipalities(): IMunicipalitiesReturn {
  const {
    data: municipalities = [],
    isLoading,
    error,
  } = useQuery<ApiMunicipality[], Error, Municipality[]>({
    queryKey: ["municipalities"],
    queryFn: getMunicipalities,
    staleTime: 1800000,
    select: (data) => {
      return data.map(
        (municipality): Municipality => ({
          ...municipality,
          meetsParisGoal:
            municipality.totalTrend <= municipality.totalCarbonLaw,
          climatePlan: municipality.climatePlanYear !== null,
        }),
      );
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
    municipalitiesLoading: isLoading,
    municipalitiesError: error,
    getTopMunicipalities,
  };
}
