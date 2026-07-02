import {
  calculateClimateTraceCountryKpis,
  CLIMATE_TRACE_BASE_YEAR,
  CLIMATE_TRACE_REPORTED_END_YEAR,
  EmissionsByYear,
} from "@/utils/europe/climateTraceKpis";

const CLIMATE_TRACE_API_BASE = "https://api.climatetrace.org/v7";
const FETCH_RETRY_ATTEMPTS = 4;
const FETCH_RETRY_BASE_DELAY_MS = 1000;

export const CLIMATE_TRACE_EMISSIONS_PARAMS = {
  gas: "co2e_100yr",
  startYear: CLIMATE_TRACE_BASE_YEAR,
  endYear: CLIMATE_TRACE_REPORTED_END_YEAR,
} as const;

export type ClimateTraceCountryRanking = {
  rank: number;
  country: string;
  name: string;
  gas: string;
  emissionsQuantity: number;
  emissionsPerCapita: number;
  percentage: number;
};

export type ClimateTraceCountryData = ClimateTraceCountryRanking & {
  emissionsByYear: EmissionsByYear;
  historicalEmissionChangePercent: number | null;
  meetsParis: boolean | null;
};

type ClimateTraceCountryRankingsResponse = {
  rankings: ClimateTraceCountryRanking[];
};

export type ClimateTraceEmissionsByIso = Record<
  string,
  ClimateTraceCountryData
>;

export function buildClimateTraceFetchYears(
  startYear: number = CLIMATE_TRACE_EMISSIONS_PARAMS.startYear,
  endYear: number = CLIMATE_TRACE_EMISSIONS_PARAMS.endYear,
): number[] {
  return Array.from(
    { length: endYear - startYear + 1 },
    (_, index) => startYear + index,
  );
}

function buildYearDateRange(year: number): { start: string; end: string } {
  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`,
  };
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchClimateTraceCountryRankingsForYear(
  year: number,
): Promise<ClimateTraceCountryRanking[]> {
  const { start, end } = buildYearDateRange(year);
  const url = new URL(`${CLIMATE_TRACE_API_BASE}/rankings/countries`);
  url.searchParams.set("gas", CLIMATE_TRACE_EMISSIONS_PARAMS.gas);
  url.searchParams.set("start", start);
  url.searchParams.set("end", end);
  url.searchParams.set("sectors", "");
  url.searchParams.set("subsectors", "");
  url.searchParams.set("countryGroup", "");
  url.searchParams.set("continent", "");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(
      `Climate TRACE API request failed for ${year}: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ClimateTraceCountryRankingsResponse;
  return data.rankings;
}

async function fetchClimateTraceCountryRankingsForYearWithRetry(
  year: number,
): Promise<ClimateTraceCountryRanking[]> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < FETCH_RETRY_ATTEMPTS; attempt++) {
    try {
      const rankings = await fetchClimateTraceCountryRankingsForYear(year);
      if (rankings.length === 0) {
        throw new Error(
          `Climate TRACE API returned no rankings for ${year}`,
        );
      }
      return rankings;
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error(String(error));
      if (attempt < FETCH_RETRY_ATTEMPTS - 1) {
        await sleep(FETCH_RETRY_BASE_DELAY_MS * 2 ** attempt);
      }
    }
  }

  throw lastError ?? new Error(`Failed to fetch Climate TRACE data for ${year}`);
}

function buildEmissionsByYearFromRankings(
  rankingsByYear: Record<number, ClimateTraceCountryRanking[]>,
): Record<string, EmissionsByYear> {
  const emissionsByIso: Record<string, EmissionsByYear> = {};

  for (const [year, rankings] of Object.entries(rankingsByYear)) {
    const numericYear = Number(year);

    for (const ranking of rankings) {
      if (!emissionsByIso[ranking.country]) {
        emissionsByIso[ranking.country] = {};
      }

      emissionsByIso[ranking.country][numericYear] = ranking.emissionsQuantity;
    }
  }

  return emissionsByIso;
}

function enrichRankingsWithTimeSeries(
  latestRankings: ClimateTraceCountryRanking[],
  emissionsByIso: Record<string, EmissionsByYear>,
): ClimateTraceEmissionsByIso {
  return Object.fromEntries(
    latestRankings.map((ranking) => {
      const emissionsByYear = emissionsByIso[ranking.country] ?? {};
      const kpis = calculateClimateTraceCountryKpis(emissionsByYear);

      return [
        ranking.country,
        {
          ...ranking,
          emissionsByYear,
          ...kpis,
        },
      ];
    }),
  );
}

function assertReportedEndYearCoverage(
  emissionsByIso: Record<string, EmissionsByYear>,
  expectedEndYear: number,
): void {
  const hasExpectedYear = Object.values(emissionsByIso).some(
    (emissionsByYear) =>
      typeof emissionsByYear[expectedEndYear] === "number" &&
      emissionsByYear[expectedEndYear] > 0,
  );

  if (!hasExpectedYear) {
    throw new Error(
      `Climate TRACE data is missing reported emissions for ${expectedEndYear}`,
    );
  }
}

export async function getClimateTraceCountryEmissions(): Promise<ClimateTraceEmissionsByIso> {
  const years = buildClimateTraceFetchYears();

  const rankingsByYearEntries = await Promise.all(
    years.map(
      async (year) =>
        [
          year,
          await fetchClimateTraceCountryRankingsForYearWithRetry(year),
        ] as const,
    ),
  );

  const rankingsByYear = Object.fromEntries(rankingsByYearEntries);
  const latestYear = years[years.length - 1];
  const latestRankings = rankingsByYear[latestYear] ?? [];
  const emissionsByIso = buildEmissionsByYearFromRankings(rankingsByYear);

  assertReportedEndYearCoverage(emissionsByIso, latestYear);

  return enrichRankingsWithTimeSeries(latestRankings, emissionsByIso);
}
