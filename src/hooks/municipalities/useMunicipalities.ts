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
    filterMunicipalities,
  };
}
