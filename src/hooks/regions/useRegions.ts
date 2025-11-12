import { useQuery } from "@tanstack/react-query";
import { getRegions } from "@/lib/api";

type RegionTimeSeriesPoint = {
  year: string;
  value: number;
};

type ApiRegion = {
  name?: string;
  region?: string;
  emissions?:
    | Record<string, number | null | undefined>
    | Array<{ year?: string | number; value?: number | null }>;
  totalTrend?: number | null;
  totalCarbonLaw?: number | null;
  approximatedHistoricalEmission?: Array<{
    year?: string | number;
    value?: number | null;
  }>;
  trend?: Array<{ year?: string | number; value?: number | null }>;
  historicalEmissionChangePercent?: number | null;
  meetsParis?: boolean | null;
  municipalities?: unknown;
};

type NullableApiRegion = ApiRegion | null | undefined;

export type RegionData = {
  name: string;
  emissions: Record<string, number>;
  totalTrend: number | null;
  totalCarbonLaw: number | null;
  historicalEmissionChangePercent: number | null;
  meetsParis: boolean | null;
  approximatedHistoricalEmission: RegionTimeSeriesPoint[];
  trend: RegionTimeSeriesPoint[];
  municipalities: string[];
};

const toEmissionRecord = (
  emissions:
    | ApiRegion["emissions"]
    | Record<string, number | null | undefined>
    | undefined,
): Record<string, number> => {
  if (!emissions) {
    return {};
  }

  if (Array.isArray(emissions)) {
    return emissions.reduce<Record<string, number>>((acc, entry) => {
      if (
        entry &&
        (typeof entry.year === "string" || typeof entry.year === "number") &&
        typeof entry.value === "number"
      ) {
        acc[String(entry.year)] = entry.value;
      }
      return acc;
    }, {});
  }

  return Object.entries(emissions).reduce<Record<string, number>>(
    (acc, [year, value]) => {
      if (typeof value === "number") {
        acc[year] = value;
      }
      return acc;
    },
    {},
  );
};

const sanitizeSeries = (
  series?: Array<{ year?: string | number; value?: number | null }>,
): RegionTimeSeriesPoint[] => {
  if (!Array.isArray(series)) {
    return [];
  }

  return series
    .filter(
      (point) =>
        point &&
        (typeof point.year === "string" || typeof point.year === "number") &&
        typeof point.value === "number",
    )
    .map((point) => ({
      year: String(point.year),
      value: point.value as number,
    }));
};

const normalizeRegion = (region: NullableApiRegion): RegionData | null => {
  if (!region) return null;

  const name =
    typeof region.region === "string" && region.region.trim().length > 0
      ? region.region
      : typeof region.name === "string" && region.name.trim().length > 0
        ? region.name
        : null;

  if (!name) return null;

  const emissions = toEmissionRecord(region.emissions);

  const totalTrend =
    typeof region.totalTrend === "number" ? region.totalTrend : null;
  const totalCarbonLaw =
    typeof region.totalCarbonLaw === "number" ? region.totalCarbonLaw : null;

  const meetsParis =
    typeof region.meetsParis === "boolean"
      ? region.meetsParis
      : totalTrend !== null && totalCarbonLaw !== null
        ? totalTrend <= totalCarbonLaw
        : null;

  const historicalEmissionChangePercent =
    typeof region.historicalEmissionChangePercent === "number"
      ? region.historicalEmissionChangePercent
      : null;

  const municipalities = Array.isArray(region.municipalities)
    ? region.municipalities.filter(
        (item): item is string => typeof item === "string",
      )
    : [];

  return {
    name,
    emissions,
    totalTrend,
    totalCarbonLaw,
    historicalEmissionChangePercent,
    meetsParis,
    approximatedHistoricalEmission: sanitizeSeries(
      region.approximatedHistoricalEmission,
    ),
    trend: sanitizeSeries(region.trend),
    municipalities,
  };
};

/**
 * Hook to get all available regions
 */
export function useRegions() {
  const {
    data: regions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["regions"],
    queryFn: getRegions,
  });

  const normalizedRegions = (regions as NullableApiRegion[])
    .map((region) => normalizeRegion(region))
    .filter((region): region is RegionData => region !== null);

  return {
    regions: normalizedRegions.map((region) => region.name),
    regionsData: normalizedRegions,
    loading: isLoading,
    error,
  };
}

// Regional KPIs moved to useRegionKPIs.ts
