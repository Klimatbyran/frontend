import { useMemo } from "react";
import regionalData from "@/data/regional-data.json";
import { KPIValue } from "@/types/entity-rankings";
import { Region } from "@/types/region";
import { t } from "i18next";

export type RegionalYearData = {
  year: number;
  total_emissions: number;
  sectors: Record<string, number>;
  subsectors: Record<string, Record<string, number>>;
};

type RegionalDataType = {
  [region: string]: {
    [year: string]: RegionalYearData | undefined;
  };
};

/**
 * Hook to get all available regions
 */
export function useRegions() {
  const data = useMemo(() => regionalData as unknown as RegionalDataType, []);

  const regions = useMemo(() => {
    return Object.keys(data);
  }, [data]);

  return {
    regions,
    loading: false,
    error: null,
  };
}

/**
 * Hook to get years available for a specific region
 */
export function useRegionYears(region: string) {
  const data = useMemo(() => regionalData as unknown as RegionalDataType, []);

  const years = useMemo(() => {
    const regionData = data[region];
    if (!regionData) return [];

    return Object.keys(regionData)
      .filter((key) => !isNaN(Number(key)))
      .map((year) => Number(year))
      .sort((a, b) => a - b);
  }, [data, region]);

  return {
    years,
    loading: false,
    error: null,
  };
}

/**
 * Hook to get total emissions for all years in a region
 */
export function useRegionTotalEmissions(region: string) {
  const data = useMemo(() => regionalData as unknown as RegionalDataType, []);
  const { years } = useRegionYears(region);

  const emissions = useMemo(() => {
    const regionData = data[region];
    if (!regionData) return [];

    return years.map((year) => {
      const yearData = regionData[year.toString()] as RegionalYearData;
      return {
        year,
        emissions: yearData.total_emissions / 1000,
      };
    });
  }, [data, region, years]);

  return {
    emissions,
    loading: false,
    error: null,
  };
}

/**
 * Hook to get emissions for all sectors for a specific year and region
 */
export function useRegionSectorEmissions(region: string, year: number) {
  const data = useMemo(() => regionalData as unknown as RegionalDataType, []);

  const sectorEmissions = useMemo(() => {
    const regionData = data[region];
    if (!regionData) return null;

    const yearData = regionData[year.toString()] as
      | RegionalYearData
      | undefined;
    if (!yearData) return null;

    return Object.entries(yearData.sectors).map(([sector, emissions]) => ({
      sector,
      emissions: emissions / 1000,
    }));
  }, [data, region, year]);

  return {
    sectorEmissions,
    loading: false,
    error: null,
  };
}

/**
 * Hook to get emissions for all subsectors within a specific sector, year, and region
 */
export function useRegionSubsectorEmissions(
  region: string,
  year: number,
  sector: string,
) {
  const data = useMemo(() => regionalData as unknown as RegionalDataType, []);

  const subsectorEmissions = useMemo(() => {
    const regionData = data[region];
    if (!regionData) return null;

    const yearData = regionData[year.toString()] as
      | RegionalYearData
      | undefined;
    if (!yearData || !yearData.subsectors[sector]) return null;

    return Object.entries(yearData.subsectors[sector]).map(
      ([subsector, emissions]) => ({
        subsector,
        emissions: emissions / 1000,
      }),
    );
  }, [data, region, year, sector]);

  return {
    subsectorEmissions,
    loading: false,
    error: null,
  };
}

/**
 * Hook to get emissions for all subsectors across all sectors for a specific year and region
 */
export function useRegionAllSubsectorEmissions(region: string, year: number) {
  const data = useMemo(() => regionalData as unknown as RegionalDataType, []);

  const allSubsectorEmissions = useMemo(() => {
    const regionData = data[region];
    if (!regionData) return null;

    const yearData = regionData[year.toString()] as
      | RegionalYearData
      | undefined;
    if (!yearData) return null;

    const result: { sector: string; subsector: string; emissions: number }[] =
      [];

    Object.entries(yearData.subsectors).forEach(([sector, subsectors]) => {
      Object.entries(subsectors).forEach(([subsector, emissions]) => {
        result.push({
          sector,
          subsector,
          emissions: emissions / 1000,
        });
      });
    });

    return result;
  }, [data, region, year]);

  return {
    allSubsectorEmissions,
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
