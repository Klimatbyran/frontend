import { useQuery } from "@tanstack/react-query";
import { getNationDetails } from "@/lib/api";
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
  emissions?: EmissionSeries | YearlyRecord;
};

function normalizeCountry(
  country: RawNationResponse["country"],
): NationStoryDetails["country"] {
  if (typeof country === "string") {
    return { sv: country, en: country === "Sverige" ? "Sweden" : country };
  }
  return { sv: country.sv, en: country.en };
}

function isYearlyRecord(value: unknown): value is YearlyRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).some((key) => !Number.isNaN(Number(key)))
  );
}

function extractYearRecord(
  emissions: EmissionSeries | YearlyRecord | undefined,
): Record<number, number> {
  const record: Record<number, number> = {};

  if (!emissions) return record;

  if (isYearlyRecord(emissions)) {
    Object.entries(emissions).forEach(([year, value]) => {
      const parsedYear = Number(year);
      if (!Number.isNaN(parsedYear) && typeof value === "number") {
        record[parsedYear] = value;
      }
    });
    return record;
  }

  emissions.forEach((point) => {
    if (!point) return;
    const parsedYear = Number(point.year);
    if (!Number.isNaN(parsedYear)) {
      record[parsedYear] = point.value;
    }
  });

  return record;
}

function hasStorySchema(response: RawNationResponse): boolean {
  const territorial = response.territorialFossilEmissions ?? response.emissions;
  return (
    !!territorial &&
    !!response.productionBasedEmissions &&
    !!response.biogenicEmissions &&
    !!response.consumptionAbroadEmissions
  );
}

function transformRawNation(response: RawNationResponse): NationStoryDetails {
  const territorialSource =
    response.territorialFossilEmissions ?? response.emissions;

  return {
    country: normalizeCountry(response.country),
    logoUrl: response.logoUrl ?? null,
    territorialFossil: extractYearRecord(territorialSource),
    productionBased: extractYearRecord(response.productionBasedEmissions),
    biogenic: extractYearRecord(response.biogenicEmissions),
    consumptionAbroad: extractYearRecord(response.consumptionAbroadEmissions),
  };
}

async function fetchNationStoryDetails(): Promise<NationStoryDetails> {
  const data = await getNationDetails();
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
    queryKey: ["nation-story"],
    queryFn: fetchNationStoryDetails,
  });

  return {
    nation: nation ?? null,
    loading: isLoading,
    error: error as Error | null,
  };
}
