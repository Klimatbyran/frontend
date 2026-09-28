import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRegions } from "@/lib/api";
import type { EmissionDataPoint } from "@/types/municipality";
import { mapEmissionArray } from "@/utils/data/emissionArrayUtils";

type ApiRegion = {
  region: string;
  emissions: ({ year: string; value: number } | null)[];
};

export type RegionListItem = {
  name: string;
  emissions: (EmissionDataPoint | null)[];
};

const normalizeRegion = (apiRegion: ApiRegion): RegionListItem => {
  return {
    name: apiRegion.region,
    emissions: mapEmissionArray(apiRegion.emissions),
  };
};

/** Fetches all regions from `/regions/` (includes emissions time series). */
export function useRegionsList() {
  const {
    data: regions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["regions"],
    queryFn: getRegions,
  });

  const normalizedRegions = useMemo(() => {
    return (regions as ApiRegion[]).map(normalizeRegion);
  }, [regions]);

  return {
    regions: normalizedRegions.map((region) => region.name),
    regionsData: normalizedRegions,
    loading: isLoading,
    error,
  };
}
