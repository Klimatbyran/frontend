import { useQuery } from "@tanstack/react-query";
import { getRegionDetails } from "@/lib/api";
import type { EmissionDataPoint } from "@/types/municipality";
import { mapEmissionArray } from "@/utils/data/emissionArrayUtils";

export type RegionDetails = {
  name: string;
  logoUrl: string | null;
  emissions: (EmissionDataPoint | null)[];
  approximatedHistoricalEmission: (EmissionDataPoint | null)[];
  trend: (EmissionDataPoint | null)[];
  meetsParis: boolean;
  historicalEmissionChangePercent: number;
  municipalities: string[];
};

type ApiRegionResponse = {
  region: string;
  logoUrl?: string | null;
  emissions: ({ year: string; value: number } | null)[];
  approximatedHistoricalEmission: ({ year: string; value: number } | null)[];
  trend: ({ year: string; value: number } | null)[];
  historicalEmissionChangePercent: number;
  meetsParis: boolean;
  municipalities: string[];
};

function transformApiRegionToRegionDetails(
  r: ApiRegionResponse,
): RegionDetails {
  return {
    name: r.region,
    logoUrl: r.logoUrl ?? null,
    municipalities: r.municipalities,
    emissions: mapEmissionArray(r.emissions),
    approximatedHistoricalEmission: mapEmissionArray(
      r.approximatedHistoricalEmission,
    ),
    trend: mapEmissionArray(r.trend),
    meetsParis: r.meetsParis ?? false,
    historicalEmissionChangePercent: r.historicalEmissionChangePercent ?? 0,
  };
}

export function useRegionDetails(name: string) {
  const {
    data: region,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["region", name],
    queryFn: () => getRegionDetails(name),
    enabled: !!name,
  });

  return {
    region: region ? transformApiRegionToRegionDetails(region) : null,
    loading: isLoading,
    error: error as Error | null,
  };
}
