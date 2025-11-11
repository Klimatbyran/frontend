import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRegions } from "@/lib/api";
import { KPIValue } from "@/types/entity-rankings";
import { Region } from "@/types/region";
import { useTranslation } from "react-i18next";

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

/**
 * Hook to get years available for a specific region
 */
export function useRegionYears(region: string, regionsData: RegionData[]) {
  const years = useMemo(() => {
    const regionData = regionsData.find((r) => r.name === region);
    if (!regionData || !regionData.emissions) return [];

    return Object.keys(regionData.emissions)
      .filter((key) => !isNaN(Number(key)))
      .map((year) => Number(year))
      .sort((a, b) => a - b);
  }, [regionsData, region]);

  return {
    years,
    loading: false,
    error: null,
  };
}

/**
 * Hook to get total emissions for all years in a region
 */
export function useRegionTotalEmissions(
  region: string,
  regionsData: RegionData[],
) {
  const { years } = useRegionYears(region, regionsData);

  const emissions = useMemo(() => {
    const regionData = regionsData.find((r) => r.name === region);
    if (!regionData || !regionData.emissions) return [];

    return years.map((year) => {
      const yearEmissions = regionData.emissions[year.toString()];
      return {
        year,
        emissions: yearEmissions / 1000 || 0,
      };
    });
  }, [regionsData, region, years]);

  return {
    emissions,
    loading: false,
    error: null,
  };
}

/**
 * Hook to get emissions for all sectors for a specific year and region
 * Note: The new API structure doesn't include sector breakdown, so this returns null
 */
export function useRegionSectorEmissions() {
  return {
    sectorEmissions: null,
    loading: false,
    error: null,
  };
}

/**
 * Hook to get emissions for all subsectors within a specific sector, year, and region
 * Note: The new API structure doesn't include subsector breakdown, so this returns null
 */
export function useRegionSubsectorEmissions() {
  return {
    subsectorEmissions: null,
    loading: false,
    error: null,
  };
}

/**
 * Hook to get emissions for all subsectors across all sectors for a specific year and region
 * Note: The new API structure doesn't include subsector breakdown, so this returns null
 */
export function useRegionAllSubsectorEmissions() {
  return {
    allSubsectorEmissions: null,
    loading: false,
    error: null,
  };
}

export const useRegionalKPIs = (): KPIValue<Region>[] => {
  const { t } = useTranslation();

  return [
    {
      label: t("regions.list.kpis.emissions.label"),
      key: "emissions",
      unit: "kt",
      description: t("regions.list.kpis.emissions.description"),
      detailedDescription: t("regions.list.kpis.emissions.detailedDescription"),
      higherIsBetter: false,
      source: "regions.list.kpis.emissions.source",
      sourceUrls: ["https://nationellaemissionsdatabasen.smhi.se/"],
    },
    {
      label: t("regions.list.kpis.historicalEmissionChangePercent.label"),
      key: "historicalEmissionChangePercent",
      unit: "%",
      description: t(
        "regions.list.kpis.historicalEmissionChangePercent.description",
      ),
      detailedDescription: t(
        "regions.list.kpis.historicalEmissionChangePercent.detailedDescription",
      ),
      higherIsBetter: false,
      source: "regions.list.kpis.historicalEmissionChangePercent.source",
      sourceUrls: ["https://nationellaemissionsdatabasen.smhi.se/"],
    },
    {
      label: t("regions.list.kpis.meetsParis.label"),
      key: "meetsParis",
      unit: "",
      description: t("regions.list.kpis.meetsParis.description"),
      detailedDescription: t(
        "regions.list.kpis.meetsParis.detailedDescription",
      ),
      higherIsBetter: true,
      isBoolean: true,
      booleanLabels: {
        true: t("regions.list.kpis.meetsParis.booleanLabels.true"),
        false: t("regions.list.kpis.meetsParis.booleanLabels.false"),
      },
      source: "regions.list.kpis.meetsParis.source",
      sourceUrls: ["https://nationellaemissionsdatabasen.smhi.se/"],
    },
    {
      label: t("regions.list.kpis.emissionsGapToParis.label"),
      key: "emissionsGapToParis",
      unit: "kt",
      description: t("regions.list.kpis.emissionsGapToParis.description"),
      detailedDescription: t(
        "regions.list.kpis.emissionsGapToParis.detailedDescription",
      ),
      higherIsBetter: false,
      source: "regions.list.kpis.emissionsGapToParis.source",
      sourceUrls: ["https://nationellaemissionsdatabasen.smhi.se/"],
    },
  ];
};
