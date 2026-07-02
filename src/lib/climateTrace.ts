import { getCurrentYear } from "@/utils/calculations/emissionsCalculations";
import {
  calculateClimateTraceCountryKpis,
  CLIMATE_TRACE_BASE_YEAR,
  EmissionsByYear,
} from "@/utils/europe/climateTraceKpis";

const CLIMATE_TRACE_API_BASE = "https://api.climatetrace.org/v7";

export const CLIMATE_TRACE_EMISSIONS_PARAMS = {
  gas: "co2e_100yr",
  startYear: CLIMATE_TRACE_BASE_YEAR,
  endYear: getCurrentYear(),
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

function buildYearDateRange(year: number): { start: string; end: string } {
  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`,
  };
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

export async function getClimateTraceCountryEmissions(): Promise<ClimateTraceEmissionsByIso> {
  const years = Array.from(
    {
      length:
        CLIMATE_TRACE_EMISSIONS_PARAMS.endYear -
        CLIMATE_TRACE_EMISSIONS_PARAMS.startYear +
        1,
    },
    (_, index) => CLIMATE_TRACE_EMISSIONS_PARAMS.startYear + index,
  );

  const rankingsByYearEntries = await Promise.all(
    years.map(
      async (year) =>
        [year, await fetchClimateTraceCountryRankingsForYear(year)] as const,
    ),
  );

  const rankingsByYear = Object.fromEntries(rankingsByYearEntries);
  const latestYear = years[years.length - 1];
  const latestRankings = rankingsByYear[latestYear] ?? [];
  const emissionsByIso = buildEmissionsByYearFromRankings(rankingsByYear);

  return enrichRankingsWithTimeSeries(latestRankings, emissionsByIso);
}
