const CLIMATE_TRACE_API_BASE = "https://api.climatetrace.org/v7";

export const CLIMATE_TRACE_EMISSIONS_PARAMS = {
  gas: "co2e_100yr",
  start: "2025-01-01",
  end: "2025-12-31",
} as const;

export type ClimateTraceCountryRanking = {
  rank: number;
  country: string;
  name: string;
  gas: string;
  emissionsQuantity: number;
  emissionsPerCapita: number;
  percentage: number;
  emissionsPercentChange: number;
};

type ClimateTraceCountryRankingsResponse = {
  rankings: ClimateTraceCountryRanking[];
};

export type ClimateTraceKpiKey =
  | "emissionsPerCapita"
  | "emissionsPercentChange";

export const CLIMATE_TRACE_KPI_KEYS = new Set<ClimateTraceKpiKey>([
  "emissionsPerCapita",
  "emissionsPercentChange",
]);

export function isClimateTraceKpiKey(
  key: PropertyKey,
): key is ClimateTraceKpiKey {
  return CLIMATE_TRACE_KPI_KEYS.has(key as ClimateTraceKpiKey);
}

export type ClimateTraceEmissionsByIso = Record<
  string,
  ClimateTraceCountryRanking
>;

export async function getClimateTraceCountryEmissions(): Promise<ClimateTraceEmissionsByIso> {
  const url = new URL(`${CLIMATE_TRACE_API_BASE}/rankings/countries`);
  url.searchParams.set("gas", CLIMATE_TRACE_EMISSIONS_PARAMS.gas);
  url.searchParams.set("start", CLIMATE_TRACE_EMISSIONS_PARAMS.start);
  url.searchParams.set("end", CLIMATE_TRACE_EMISSIONS_PARAMS.end);
  url.searchParams.set("sectors", "");
  url.searchParams.set("subsectors", "");
  url.searchParams.set("countryGroup", "");
  url.searchParams.set("continent", "");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(
      `Climate TRACE API request failed: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ClimateTraceCountryRankingsResponse;

  return Object.fromEntries(
    data.rankings.map((ranking) => [ranking.country, ranking]),
  );
}
