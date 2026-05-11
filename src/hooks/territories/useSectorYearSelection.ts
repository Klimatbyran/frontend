import { useEffect, useState } from "react";
import {
  getAvailableYearsFromSectors,
  getCurrentYearFromAvailable,
} from "@/utils/detail/sectorYearUtils";
import type { SectorEmissionsResponse } from "@/types/emissions";

type SectorEmissionsInput =
  | SectorEmissionsResponse
  | { sectors?: Record<string, Record<string, number>> }
  | null;

export function useSectorYearSelection(
  sectorEmissions: SectorEmissionsInput,
  defaultYear?: number,
) {
  const [selectedYear, setSelectedYear] = useState<string>("");

  const availableYears = getAvailableYearsFromSectors(sectorEmissions);

  useEffect(() => {
    if (selectedYear === "" && availableYears.length > 0) {
      setSelectedYear(availableYears[0].toString());
    }
  }, [availableYears, selectedYear]);

  const currentYear = getCurrentYearFromAvailable(
    selectedYear,
    availableYears,
    defaultYear ?? 2023,
  );

  return { selectedYear, setSelectedYear, availableYears, currentYear };
}
