import { useQuery } from "@tanstack/react-query";
import { getNationDetails } from "@/lib/api";
import type { EmissionDataPoint } from "@/types/municipality";
import { mapEmissionArray } from "@/utils/data/emissionArrayUtils";

export type NationDetails = {
  country: { sv: string; en: string };
  logoUrl: string | null;
  emissions: (EmissionDataPoint | null)[];
  approximatedHistoricalEmission: (EmissionDataPoint | null)[];
  trend: (EmissionDataPoint | null)[];
  meetsParis: boolean;
  historicalEmissionChangePercent: number;
};

type ApiNationResponse = {
  country: { sv: string; en: string };
  logoUrl?: string | null;
  emissions: ({ year: string; value: number } | null)[];
  approximatedHistoricalEmission: ({ year: string; value: number } | null)[];
  trend: ({ year: string; value: number } | null)[];
  historicalEmissionChangePercent: number;
  meetsParis: boolean;
};

function transformApiNationToNationDetails(
  r: ApiNationResponse,
): NationDetails {
  return {
    country: { sv: r.country.sv, en: r.country.en },
    logoUrl: r.logoUrl ?? null,
    emissions: mapEmissionArray(r.emissions),
    approximatedHistoricalEmission: mapEmissionArray(
      r.approximatedHistoricalEmission,
    ),
    trend: mapEmissionArray(r.trend),
    meetsParis: r.meetsParis ?? false,
    historicalEmissionChangePercent: r.historicalEmissionChangePercent ?? 0,
  };
}

export function useNationDetails() {
  const {
    data: nation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["nation"],
    queryFn: () => getNationDetails(),
  });

  return {
    nation: nation ? transformApiNationToNationDetails(nation) : null,
    loading: isLoading,
    error: error as Error | null,
  };
}
