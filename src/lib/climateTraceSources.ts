import { CLIMATE_TRACE_EMISSIONS_PARAMS } from "@/lib/climateTrace";
import type { ClimateTraceEmissionsSector } from "@/utils/europe/climateTraceSectors";

const CLIMATE_TRACE_API_BASE = "https://api.climatetrace.org/v7";
const FETCH_RETRY_ATTEMPTS = 4;
const FETCH_RETRY_BASE_DELAY_MS = 1000;
export const CLIMATE_TRACE_SOURCES_LIMIT = 50;

export type ClimateTraceSourceSummary = {
  id: number;
  name: string;
  sector: ClimateTraceEmissionsSector | string;
  subsector: string;
  country: string;
  sourceType: string;
  centroid: {
    latitude: number;
    longitude: number;
    srid: number;
  };
  gas: string;
  emissionsQuantity: number;
  year: number;
};

export type RankedClimateTraceSource = ClimateTraceSourceSummary & {
  rank: number;
};

export function rankClimateTraceSources(
  sources: ClimateTraceSourceSummary[],
): RankedClimateTraceSource[] {
  return sources.map((source, index) => ({
    ...source,
    rank: index + 1,
  }));
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchClimateTraceSourcesForCountry(
  iso3: string,
  year: number,
  limit: number = CLIMATE_TRACE_SOURCES_LIMIT,
): Promise<RankedClimateTraceSource[]> {
  const url = new URL(`${CLIMATE_TRACE_API_BASE}/sources`);
  url.searchParams.set("year", String(year));
  url.searchParams.set("gas", CLIMATE_TRACE_EMISSIONS_PARAMS.gas);
  url.searchParams.set("sectors", CLIMATE_TRACE_EMISSIONS_PARAMS.sectors);
  url.searchParams.set("gadmId", iso3.toUpperCase());
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", "0");

  let lastError: Error | undefined;

  for (let attempt = 0; attempt < FETCH_RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(
          `Climate TRACE sources request failed for ${iso3}: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as ClimateTraceSourceSummary[];
      return rankClimateTraceSources(
        data.filter(
          (source) =>
            source.centroid &&
            Number.isFinite(source.centroid.latitude) &&
            Number.isFinite(source.centroid.longitude) &&
            source.emissionsQuantity > 0,
        ),
      );
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < FETCH_RETRY_ATTEMPTS - 1) {
        await sleep(FETCH_RETRY_BASE_DELAY_MS * 2 ** attempt);
      }
    }
  }

  throw (
    lastError ?? new Error(`Failed to fetch Climate TRACE sources for ${iso3}`)
  );
}

export function getEmissionSourceMarkerRadius(
  emissionsQuantity: number,
  maxEmissionsQuantity: number,
): number {
  if (maxEmissionsQuantity <= 0) {
    return 6;
  }

  const normalized = Math.sqrt(emissionsQuantity / maxEmissionsQuantity);
  return Math.max(5, Math.round(4 + normalized * 14));
}
