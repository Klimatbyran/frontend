import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNationalData } from "@/lib/api";

export type NationalYearData = {
  year: number;
  total_emissions: number;
  sectors: Record<string, number>;
  subsectors: Record<string, Record<string, number>>;
};

type NationalDataType = {
  country: { sv: string; en: string };
  years: Record<number, NationalYearData>;
};

interface UseNationalDataReturn {
  /** The entire national emissions dataset */
  data: NationalDataType | null;

  /** Loading state */
  loading: boolean;

  /** Error state */
  error: unknown;

  /** Get an array of all available years in the dataset */
  getYears: () => number[];

  /** Get total emissions for each year */
  getTotalEmissions: () => { year: number; emissions: number }[];

  /** Get emissions for all sectors for a specific year */
  getSectorEmissions: (
    year: number,
  ) => { sector: string; emissions: number }[] | null;

  /** Get emissions for all subsectors within a specific sector and year */
  getSubsectorEmissions: (
    year: number,
    sector: string,
  ) => { subsector: string; emissions: number }[] | null;

  /** Get emissions for all subsectors across all sectors for a specific year */
  getAllSubsectorEmissions: (
    year: number,
  ) => { sector: string; subsector: string; emissions: number }[] | null;
}

export function useNationalData(): UseNationalDataReturn {
  const {
    data: nationalData = null,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["national-data"],
    queryFn: getNationalData,
  });

  const data = useMemo(
    () => nationalData as NationalDataType | null,
    [nationalData],
  );

  // Get an array of all available years
  const getYears = (): number[] => {
    if (!data) return [];
    return data.years
      ? Object.keys(data.years)
          .map(Number)
          .sort((a, b) => a - b)
      : [];
  };

  // Get total emissions for all years
  const getTotalEmissions = (): { year: number; emissions: number }[] => {
    if (!data) return [];
    const years = getYears();
    return years.map((year) => {
      const yearData = data.years?.[year] as NationalYearData;
      return {
        year,
        emissions: yearData.total_emissions,
      };
    });
  };

  // Get emissions for all sectors for a specific year
  const getSectorEmissions = (
    year: number,
  ): { sector: string; emissions: number }[] | null => {
    if (!data) return null;
    const yearData = data.years?.[year] as NationalYearData | undefined;

    if (!yearData) return null;

    return Object.entries(yearData.sectors).map(([sector, emissions]) => ({
      sector,
      emissions,
    }));
  };

  // Get emissions for all subsectors within a specific sector and year
  const getSubsectorEmissions = (
    year: number,
    sector: string,
  ): { subsector: string; emissions: number }[] | null => {
    if (!data) return null;
    const yearData = data.years?.[year] as NationalYearData | undefined;

    if (!yearData || !yearData.subsectors[sector]) return null;

    return Object.entries(yearData.subsectors[sector]).map(
      ([subsector, emissions]) => ({
        subsector,
        emissions,
      }),
    );
  };

  // Get emissions for all subsectors across all sectors for a specific year
  const getAllSubsectorEmissions = (
    year: number,
  ): { sector: string; subsector: string; emissions: number }[] | null => {
    if (!data) return null;
    const yearData = data.years?.[year] as NationalYearData | undefined;

    if (!yearData) return null;

    const result: { sector: string; subsector: string; emissions: number }[] =
      [];

    Object.entries(yearData.subsectors).forEach(([sector, subsectors]) => {
      Object.entries(subsectors).forEach(([subsector, emissions]) => {
        result.push({
          sector,
          subsector,
          emissions,
        });
      });
    });

    return result;
  };

  return {
    data,
    loading: isLoading,
    error,
    getYears,
    getTotalEmissions,
    getSectorEmissions,
    getSubsectorEmissions,
    getAllSubsectorEmissions,
  };
}
