import { useMemo, useState } from "react";
import {
  useNationDetails,
  useNationDetailHeaderStats,
} from "@/hooks/nation/useNationDetails";
import { useSectorEmissions } from "@/hooks/territories/useSectorEmissions";
import { useSectors } from "@/hooks/territories/useSectors";
import { useHiddenItems } from "@/components/charts";
import {
  getAvailableYearsFromSectors,
  getCurrentYearFromAvailable,
} from "@/utils/detail/sectorYearUtils";
import { useRegions } from "@/hooks/useRegions";
import { transformNationEmissionsData } from "@/utils/detail/nationEmissionsUtils";

export function useNationPageData() {
  const { nation, loading, error } = useNationDetails();
  const { regions } = useRegions();
  const { sectorEmissions } = useSectorEmissions("nation", undefined);
  const { getSectorInfo } = useSectors();
  const { hiddenItems: filteredSectors, setHiddenItems: setFilteredSectors } =
    useHiddenItems<string>([]);
  const [selectedYear, setSelectedYear] = useState<string>("2023");

  const sortedRegions = useMemo(() => [...regions].sort(), [regions]);
  const emissionsData = useMemo(
    () => (nation ? transformNationEmissionsData(nation) : []),
    [nation],
  );

  const lastYearEmissions = useMemo(() => {
    return emissionsData
      .filter((d) => d.total !== undefined)
      .sort((a, b) => b.year - a.year)[0];
  }, [emissionsData]);
  const lastYear = lastYearEmissions?.year;
  const headerStats = useNationDetailHeaderStats(nation, lastYear);
  const availableYears = getAvailableYearsFromSectors(sectorEmissions);
  const currentYear = getCurrentYearFromAvailable(
    selectedYear,
    availableYears,
    lastYear ?? 2023,
  );

  return {
    nation,
    loading,
    error,
    sortedRegions,
    emissionsData,
    sectorEmissions,
    getSectorInfo,
    filteredSectors,
    setFilteredSectors,
    selectedYear,
    setSelectedYear,
    headerStats,
    availableYears,
    currentYear,
  };
}
