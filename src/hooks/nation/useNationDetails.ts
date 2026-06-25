import { useQuery } from "@tanstack/react-query";
import { getNationDetails } from "@/lib/api";
import nationFixture from "@/data/nation-data.fixture.json";
import type { NationEmissionSeries } from "@/utils/data/nationStoryMetrics";

export type YearValuePoint = {
  year: number;
  value: number;
};

export type NationDetails = {
  country: { sv: string; en: string };
  logoUrl: string | null;
  exportOfOilProductsPoints: YearValuePoint[];
} & NationEmissionSeries;

type YearlyRecord = Record<string, number>;
type EmissionSeries = ({ year: string; value: number } | null)[] | undefined;

type RawNationResponse = {
  country: { sv: string; en: string } | string;
  logoUrl?: string | null;
  territorialFossilEmissions?: EmissionSeries | YearlyRecord;
  biogenicEmissions?: EmissionSeries | YearlyRecord;
  consumptionAbroadEmissions?: EmissionSeries | YearlyRecord;
  eCommerceEmissions?: EmissionSeries | YearlyRecord;
  exportOfOilProductsEmissions?: EmissionSeries | YearlyRecord;
  emissions?: EmissionSeries | YearlyRecord;
};

function normalizeCountry(
  country: RawNationResponse["country"],
): NationDetails["country"] {
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
    !!response.biogenicEmissions &&
    !!response.consumptionAbroadEmissions
  );
}

function recordToSortedPoints(record: Record<number, number>): YearValuePoint[] {
  return Object.entries(record)
    .map(([year, value]) => ({ year: Number(year), value }))
    .sort((a, b) => a.year - b.year);
}

function transformRawNation(response: RawNationResponse): NationDetails {
  const territorialSource =
    response.territorialFossilEmissions ?? response.emissions;

  const exportOfOilProducts = extractYearRecord(
    response.exportOfOilProductsEmissions,
  );

  return {
    country: normalizeCountry(response.country),
    logoUrl: response.logoUrl ?? null,
    territorialFossil: extractYearRecord(territorialSource),
    biogenic: extractYearRecord(response.biogenicEmissions),
    consumptionAbroad: extractYearRecord(response.consumptionAbroadEmissions),
    eCommerce: extractYearRecord(response.eCommerceEmissions),
    exportOfOilProducts,
    exportOfOilProductsPoints: recordToSortedPoints(exportOfOilProducts),
  };
}

function getFixtureNation(): RawNationResponse {
  const fixtureEntry = nationFixture[0] as RawNationResponse;
  return fixtureEntry;
}

async function fetchNationDetails(): Promise<NationDetails> {
  const data = await getNationDetails();
  const raw = (Array.isArray(data) ? data[0] : data) as RawNationResponse;

  if (hasStorySchema(raw)) {
    return transformRawNation(raw);
  }

  if (import.meta.env.DEV) {
    console.warn(
      "[nation] API response missing PR #1311 fields; using nation-data.fixture.json",
    );
    return transformRawNation(getFixtureNation());
  }

  return transformRawNation(raw);
}

export function useNationDetails() {
  const {
    data: nation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["nation"],
    queryFn: fetchNationDetails,
  });

  return {
    nation: nation ?? null,
    loading: isLoading,
    error: error as Error | null,
  };
}
