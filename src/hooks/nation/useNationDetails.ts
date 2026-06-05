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

type ApiEmissionsSeries = ({ year: string; value: number } | null)[];

type ApiNationResponse = {
  country: { sv: string; en: string } | string;
  logoUrl?: string | null;
  emissions?: ApiEmissionsSeries;
  territorialFossilEmissions?: ApiEmissionsSeries;
  approximatedHistoricalEmission: ApiEmissionsSeries;
  trend: ApiEmissionsSeries;
  historicalEmissionChangePercent: number;
  meetsParis: boolean;
};

function normalizeCountry(
  country: ApiNationResponse["country"],
): NationDetails["country"] {
  if (typeof country === "string") {
    return { sv: country, en: country };
  }

  return { sv: country.sv, en: country.en };
}

function getPrimaryEmissionsSeries(
  response: ApiNationResponse,
): ApiEmissionsSeries | undefined {
  return response.emissions ?? response.territorialFossilEmissions;
}

function transformApiNationToNationDetails(
  r: ApiNationResponse,
): NationDetails {
  return {
    country: normalizeCountry(r.country),
    logoUrl: r.logoUrl ?? null,
    emissions: mapEmissionArray(getPrimaryEmissionsSeries(r)),
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
