/**
 * Type for sector emissions response from API (with sectors wrapper)
 */
export type SectorEmissionsResponse = {
  sectors: {
    [year: string]: {
      [sector: string]: number;
    };
  };
} | null;

/**
 * Gets available years from sector emissions data.
 * Filters out years that don't have any sector data.
 * Accepts either the API response format (with sectors property) or the SectorEmissions type.
 */
export function getAvailableYearsFromSectors(
  sectorEmissions: SectorEmissionsResponse | { sectors?: Record<string, Record<string, number>> } | null,
): number[] {
  if (!sectorEmissions?.sectors) {
    return [];
  }

  return Object.keys(sectorEmissions.sectors)
    .map(Number)
    .filter(
      (year) =>
        !isNaN(year) &&
        Object.keys(sectorEmissions.sectors[year] || {}).length > 0,
    )
    .sort((a, b) => b - a);
}

/**
 * Determines the current year to use from available years.
 * Uses the selectedYear if it's available, otherwise defaults to the first available year.
 */
export function getCurrentYearFromAvailable(
  selectedYear: string,
  availableYears: number[],
  defaultYear: number = 2023,
): number {
  if (
    availableYears.length > 0 &&
    availableYears.includes(parseInt(selectedYear))
  ) {
    return parseInt(selectedYear);
  }
  return availableYears[0] || defaultYear;
}

