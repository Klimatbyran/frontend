import { useQuery } from "@tanstack/react-query";
import { getNationDetails } from "@/lib/api";
import type { EmissionDataPoint } from "@/types/municipality";
import { mapEmissionArray } from "@/utils/data/emissionArrayUtils";
import {
  computeNationDerivedMetrics,
  extractYearRecord,
  type NationEmissionBreakdown,
} from "@/utils/data/nationTerritorialTransforms";
import { normalizeNationCountry } from "@/hooks/nation/normalizeNationCountry";

export type NationDetails = {
  country: { sv: string; en: string };
  logoUrl: string | null;
  emissions: (EmissionDataPoint | null)[];
  approximatedHistoricalEmission: (EmissionDataPoint | null)[];
  trend: (EmissionDataPoint | null)[];
  meetsParis: boolean;
  historicalEmissionChangePercent: number;
  emissionBreakdown: NationEmissionBreakdown;
};

type EmissionSeries =
  | ({ year: string | number; value: number } | null)[]
  | Record<string, number>
  | undefined;

type ApiNationResponse = {
  country: { sv: string; en: string } | string;
  logoUrl?: string | null;
  territorialFossilEmissions?: EmissionSeries;
  biogenicEmissions?: EmissionSeries;
  consumptionAbroadEmissions?: EmissionSeries;
  exportOfOilProductsEmissions?: EmissionSeries;
  eCommerceEmissions?: EmissionSeries;
  emissions?: EmissionSeries;
  approximatedHistoricalEmission?: EmissionSeries;
  trend?: EmissionSeries;
  historicalEmissionChangePercent?: number;
  meetsParis?: boolean;
};

function getTerritorialFossilSeries(
  response: ApiNationResponse,
): EmissionSeries | undefined {
  return response.territorialFossilEmissions ?? response.emissions;
}

function hasLegacyTrendFields(response: ApiNationResponse): boolean {
  return (
    Array.isArray(response.approximatedHistoricalEmission) &&
    Array.isArray(response.trend)
  );
}

function buildEmissionBreakdown(
  response: ApiNationResponse,
): NationEmissionBreakdown {
  return {
    territorialFossil: extractYearRecord(getTerritorialFossilSeries(response)),
    biogenic: extractYearRecord(response.biogenicEmissions),
    consumptionAbroad: extractYearRecord(response.consumptionAbroadEmissions),
    exportOfOilProducts: extractYearRecord(
      response.exportOfOilProductsEmissions,
    ),
    eCommerce: extractYearRecord(response.eCommerceEmissions),
  };
}

function transformLegacyNationResponse(
  response: ApiNationResponse,
): NationDetails {
  return {
    country: normalizeNationCountry(response.country),
    logoUrl: response.logoUrl ?? null,
    emissions: mapEmissionArray(getTerritorialFossilSeries(response)),
    approximatedHistoricalEmission: mapEmissionArray(
      response.approximatedHistoricalEmission,
    ),
    trend: mapEmissionArray(response.trend),
    meetsParis: response.meetsParis ?? false,
    historicalEmissionChangePercent:
      response.historicalEmissionChangePercent ?? 0,
    emissionBreakdown: buildEmissionBreakdown(response),
  };
}

function transformNewNationResponse(
  response: ApiNationResponse,
): NationDetails {
  const territorialFossil = extractYearRecord(
    getTerritorialFossilSeries(response),
  );
  const derived = computeNationDerivedMetrics(territorialFossil);

  return {
    country: normalizeNationCountry(response.country),
    logoUrl: response.logoUrl ?? null,
    emissions: derived.emissions,
    approximatedHistoricalEmission: derived.approximatedHistoricalEmission,
    trend: derived.trend,
    meetsParis: derived.meetsParis,
    historicalEmissionChangePercent: derived.historicalEmissionChangePercent,
    emissionBreakdown: buildEmissionBreakdown(response),
  };
}

function transformApiNationToNationDetails(
  response: ApiNationResponse,
): NationDetails {
  if (hasLegacyTrendFields(response)) {
    return transformLegacyNationResponse(response);
  }

  return transformNewNationResponse(response);
}

export function useNationDetails() {
  const {
    data: nation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["nation"],
    queryFn: async () => {
      const data = await getNationDetails();
      const response = (
        Array.isArray(data) ? data[0] : data
      ) as ApiNationResponse;
      return transformApiNationToNationDetails(response);
    },
  });

  return {
    nation: nation ?? null,
    loading: isLoading,
    error: error as Error | null,
  };
}
