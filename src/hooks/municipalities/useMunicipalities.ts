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
  getMunicipalitiesForMap: (count?: number) => Array<{
    id: string;
    name: string;
    value: number;
    path: string;
  }>;
  filterMunicipalities: (params: {
    region?: string;
    searchQuery?: string;
    sortBy?: "emissions" | "reduction" | "name";
  }) => Municipality[];
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
      // Transform data if needed
      return data;
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

  // Get municipalities data formatted for map
  const getMunicipalitiesForMap = (count: number = 10) => {
    return municipalities
      .filter((m) => m.bicycleMetrePerCapita != null)
      .sort((a, b) => b.bicycleMetrePerCapita - a.bicycleMetrePerCapita)
      .slice(0, count)
      .map((municipality) => ({
        id: municipality.id,
        name: municipality.name,
        value: municipality.bicycleMetrePerCapita,
        path: "M100,200 L120,220 L110,240 Z", // TODO: Replace with real SVG paths
      }));
  };

  // Filter and sort municipalities
  const filterMunicipalities = ({
    region = "all",
    searchQuery = "",
    sortBy = "emissions",
  }) => {
    return municipalities
      .filter((municipality) => {
        // Filter by region
        if (region !== "all" && municipality.region !== region) {
          return false;
        }

        // Filter by search query
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          return municipality.name.toLowerCase().includes(searchLower);
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "emissions":
            return b.trendEmission - a.trendEmission;
          case "reduction":
            return (
              a.historicalEmissionChangePercent -
              b.historicalEmissionChangePercent
            );
          case "name":
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
  };

  return {
    municipalities,
    loading: isLoading,
    error,
    getTopMunicipalities,
    getMunicipalitiesForMap,
    filterMunicipalities,
  };
}
