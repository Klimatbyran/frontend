import { useMemo } from "react";
import { getAvailableYearsFromSectors } from "@/utils/detail/sectorYearUtils";
import type { SectorEmissionsResponse } from "@/types/emissions";

type SectorEmissionsInput =
  | SectorEmissionsResponse
  | { sectors?: Record<string, Record<string, number>> }
  | null;

export function useSectorYearSelection(
  sectorEmissions: SectorEmissionsInput,
  defaultYear?: number,
) {
  const availableYears = useMemo(
    () => getAvailableYearsFromSectors(sectorEmissions),
    [sectorEmissions],
  );

  const currentYear = availableYears[0] ?? defaultYear ?? 2023;

  return { availableYears, currentYear };
}
