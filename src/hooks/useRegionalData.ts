import { useMemo } from "react";
import regionalData from "@/data/regional-data.json";

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

interface UseRegionalDataReturn {
  /** The entire regional emissions dataset */
  data: RegionalDataType;

  /** Get an array of all available regions in the dataset */
  getRegions: () => string[];

  /** Get an array of all available years for a specific region */
  getYears: (region: string) => number[];

  /** Get total emissions for each year in a region */
  getTotalEmissions: (region: string) => { year: number; emissions: number }[];

  /** Get emissions for all sectors for a specific year and region */
  getSectorEmissions: (
    region: string,
    year: number,
  ) => { sector: string; emissions: number }[] | null;

  /** Get emissions for all subsectors within a specific sector, year, and region */
  getSubsectorEmissions: (
    region: string,
    year: number,
    sector: string,
  ) => { subsector: string; emissions: number }[] | null;

  /** Get emissions for all subsectors across all sectors for a specific year and region */
  getAllSubsectorEmissions: (
    region: string,
    year: number,
  ) => { sector: string; subsector: string; emissions: number }[] | null;
}

export function useRegionalData(): UseRegionalDataReturn {
  const data = useMemo(() => regionalData as unknown as RegionalDataType, []);

  // Internal function to get the region data by handling mapping automatically
  const getRegionData = (regionName: string) => {
    return data[regionName];
  };

  const getRegions = (): string[] => {
    // Return all region names directly from the data
    return Object.keys(data);
  };

  // Get an array of all available years for a specific region
  const getYears = (region: string): number[] => {
    const regionData = getRegionData(region);
    if (!regionData) return [];

    return Object.keys(regionData)
      .filter((key) => !isNaN(Number(key)))
      .map((year) => Number(year))
      .sort((a, b) => a - b);
  };

  // Get total emissions for all years in a region
  const getTotalEmissions = (
    region: string,
  ): { year: number; emissions: number }[] => {
    const years = getYears(region);
    const regionData = getRegionData(region);
    if (!regionData) return [];

    return years.map((year) => {
      const yearData = regionData[year.toString()] as RegionalYearData;
      return {
        year,
        emissions: yearData.total_emissions / 1000,
      };
    });
  };

  // Get emissions for all sectors for a specific year and region
  const getSectorEmissions = (
    region: string,
    year: number,
  ): { sector: string; emissions: number }[] | null => {
    const regionData = getRegionData(region);
    if (!regionData) return null;

    const yearData = regionData[year.toString()] as
      | RegionalYearData
      | undefined;

    if (!yearData) return null;

    return Object.entries(yearData.sectors).map(([sector, emissions]) => ({
      sector,
      emissions: emissions / 1000,
    }));
  };

  // Get emissions for all subsectors within a specific sector, year, and region
  const getSubsectorEmissions = (
    region: string,
    year: number,
    sector: string,
  ): { subsector: string; emissions: number }[] | null => {
    const regionData = getRegionData(region);
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
  };

  // Get emissions for all subsectors across all sectors for a specific year and region
  const getAllSubsectorEmissions = (
    region: string,
    year: number,
  ): { sector: string; subsector: string; emissions: number }[] | null => {
    const regionData = getRegionData(region);
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
  };

  return {
    data,
    getRegions,
    getYears,
    getTotalEmissions,
    getSectorEmissions,
    getSubsectorEmissions,
    getAllSubsectorEmissions,
  };
}
