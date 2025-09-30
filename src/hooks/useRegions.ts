import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRegions } from "@/lib/api";
import { KPIValue } from "@/types/entity-rankings";
import { Region } from "@/types/region";
import { t } from "i18next";

// Updated types to match the new API structure
export type RegionData = {
  name: string;
  emissions: Record<string, number>;
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

  return {
    regions: (regions as RegionData[]).map((region) => region.name),
    regionsData: regions as RegionData[],
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

export function getRegionalKPIs(): KPIValue[] {
  return [
    {
      label: t("regions.kpis.emissions.label"),
      key: "emissions" as keyof Region,
      unit: "t",
      description: "regions.kpis.emissions.description",
      higherIsBetter: false,
      source: "regions.kpis.emissions.source",
      sourceUrls: ["https://nationellaemissionsdatabasen.smhi.se/"],
      detailedDescription: "regions.kpis.emissions.detailedDescription",
    },
  ];
}
