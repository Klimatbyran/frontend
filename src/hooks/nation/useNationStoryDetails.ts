import { useQuery } from "@tanstack/react-query";
import { getAdditionalNationData } from "@/lib/api";
import { normalizeNationCountry } from "@/hooks/nation/normalizeNationCountry";
import { extractYearRecord } from "@/utils/data/nationTerritorialTransforms";
import type { NationEmissionSeries } from "@/utils/data/nationStoryMetrics";

export type NationStoryDetails = {
  country: { sv: string; en: string };
  logoUrl: string | null;
} & NationEmissionSeries;

type YearlyRecord = Record<string, number>;
type EmissionSeries = ({ year: string; value: number } | null)[] | undefined;

type RawNationResponse = {
  country: { sv: string; en: string } | string;
  logoUrl?: string | null;
  territorialFossilEmissions?: EmissionSeries | YearlyRecord;
  productionBasedEmissions?: EmissionSeries | YearlyRecord;
  biogenicEmissions?: EmissionSeries | YearlyRecord;
  consumptionAbroadEmissions?: EmissionSeries | YearlyRecord;
  eCommerceEmissions?: EmissionSeries | YearlyRecord;
  emissions?: EmissionSeries | YearlyRecord;
};

function hasEmissionData(
  emissions: EmissionSeries | YearlyRecord | undefined,
): boolean {
  return Object.keys(extractYearRecord(emissions)).length > 0;
}

function hasStorySchema(response: RawNationResponse): boolean {
  const territorial = response.territorialFossilEmissions ?? response.emissions;
  return (
    hasEmissionData(territorial) &&
    hasEmissionData(response.productionBasedEmissions) &&
    hasEmissionData(response.biogenicEmissions) &&
    hasEmissionData(response.consumptionAbroadEmissions)
  );
}

function transformRawNation(response: RawNationResponse): NationStoryDetails {
  const territorialSource =
    response.territorialFossilEmissions ?? response.emissions;

  return {
    country: normalizeNationCountry(response.country),
    logoUrl: response.logoUrl ?? null,
    territorialFossil: extractYearRecord(territorialSource),
    productionBased: extractYearRecord(response.productionBasedEmissions),
    biogenic: extractYearRecord(response.biogenicEmissions),
    consumptionAbroad: extractYearRecord(response.consumptionAbroadEmissions),
    eCommerce: extractYearRecord(response.eCommerceEmissions),
  };
}

async function fetchNationStoryDetails(): Promise<NationStoryDetails> {
  const data = await getAdditionalNationData();
  const raw = (Array.isArray(data) ? data[0] : data) as RawNationResponse;

  if (!hasStorySchema(raw)) {
    throw new Error(
      "Nation API response is missing required story emission series",
    );
  }

  return transformRawNation(raw);
}

export function useNationStoryDetails() {
  const {
    data: nation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["additional-nation-story"],
    queryFn: fetchNationStoryDetails,
  });

  return {
    nation: nation ?? null,
    loading: isLoading,
    error: error as Error | null,
  };
}
