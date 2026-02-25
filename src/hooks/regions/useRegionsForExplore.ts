import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRegions } from "@/lib/api";

export type RegionForExplore = {
  name: string;
  logoUrl: string | null;
  emissions: Record<string, number>;
  meetsParis: boolean;
  historicalEmissionChangePercent: number;
  municipalityCount: number;
};

type ApiRegion = {
  region: string;
  logoUrl?: string | null;
  emissions: ({ year: string; value: number } | null)[];
  historicalEmissionChangePercent: number;
  meetsParis: boolean;
  municipalities: string[];
};

function normalizeRegion(apiRegion: ApiRegion): RegionForExplore {
  const emissions: Record<string, number> = {};
  apiRegion.emissions.forEach((emission) => {
    if (emission) {
      emissions[emission.year] = emission.value;
    }
  });

  return {
    name: apiRegion.region,
    logoUrl: apiRegion.logoUrl ?? null,
    emissions,
    meetsParis: apiRegion.meetsParis ?? false,
    historicalEmissionChangePercent:
      apiRegion.historicalEmissionChangePercent ?? 0,
    municipalityCount: apiRegion.municipalities?.length ?? 0,
  };
}

/**
 * Hook to get all regions with data needed for the explore list (emissions, meetsParis, change %).
 */
export function useRegionsForExplore() {
  const {
    data: regions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["regions"],
    queryFn: getRegions,
  });

  const regionsForExplore = useMemo(() => {
    return (regions as ApiRegion[]).map(normalizeRegion);
  }, [regions]);

  return {
    regions: regionsForExplore,
    loading: isLoading,
    error: error as Error | undefined,
  };
}
