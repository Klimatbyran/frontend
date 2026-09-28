import { useQuery } from "@tanstack/react-query";
import { getExploreRegionsPage } from "@/lib/api";
import { mapExploreRegion } from "@/lib/page-mappers";

export type RegionForExplore = {
  name: string;
  logoUrl: string | null;
  lastYear: number | null;
  lastYearEmissions: number | null;
  meetsParis: boolean;
  historicalEmissionChangePercent: number;
  municipalityCount: number;
  municipalities: string[];
};

/**
 * List-card fields for the regions explore tab, comparison, and nation region list.
 * Comes from `/pages/explore/regions` instead of the full `/regions/` payload.
 */
export function useRegionsForExplore(options?: { enabled?: boolean }) {
  const {
    data: regions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pages", "explore", "regions"],
    queryFn: getExploreRegionsPage,
    enabled: options?.enabled ?? true,
    staleTime: 1800000,
    select: (data): RegionForExplore[] => data.items.map(mapExploreRegion),
  });

  return {
    regions,
    loading: isLoading,
    error,
  };
}
