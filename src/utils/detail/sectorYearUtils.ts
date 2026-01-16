import { SectorEmissionsResponse } from "@/types/emissions";

export function getAvailableYearsFromSectors(
  sectorEmissions:
    | SectorEmissionsResponse
    | { sectors?: Record<string, Record<string, number>> }
    | null,
): number[] {
  if (!sectorEmissions?.sectors) {
    return [];
  }

  return Object.keys(sectorEmissions.sectors)
    .map(Number)
    .filter(
      (year) =>
        !isNaN(year) &&
        Object.keys(sectorEmissions.sectors?.[year] || {}).length > 0,
    )
    .sort((a, b) => b - a);
}

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
