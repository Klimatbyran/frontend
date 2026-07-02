import { useMemo } from "react";
import { useHiddenItems } from "@/components/charts";
import { useSectorEmissions } from "@/hooks/territories/useSectorEmissions";
import { useSectors } from "@/hooks/territories/useSectors";
import { useSectorYearSelection } from "@/hooks/territories/useSectorYearSelection";
import { useNationDetails } from "@/hooks/nation/useNationDetails";
import { useRegionsList } from "@/hooks/regions/useRegionsList";
import { useEuropeanCountryPageData } from "@/hooks/europe/useEuropeanCountryPageData";
import { SWEDEN_ISO3 } from "@/hooks/europe/useEuropeanCountryDetails";

export function useNationPageData() {
  const {
    nation,
    loading: nationLoading,
    error: nationError,
  } = useNationDetails();
  const { regions } = useRegionsList();
  const {
    loading: climateTraceLoading,
    error: climateTraceError,
    emissionsData,
    headerStats,
  } = useEuropeanCountryPageData(SWEDEN_ISO3);

  const { sectorEmissions } = useSectorEmissions("nation");
  const { getSectorInfo } = useSectors();
  const { hiddenItems: filteredSectors, setHiddenItems: setFilteredSectors } =
    useHiddenItems<string>([]);

  const sortedRegions = useMemo(() => [...regions].sort(), [regions]);

  const lastYear = useMemo(() => {
    return emissionsData
      .filter((point) => point.total !== undefined)
      .sort((a, b) => b.year - a.year)[0]?.year;
  }, [emissionsData]);

  const { selectedYear, setSelectedYear, availableYears, currentYear } =
    useSectorYearSelection(sectorEmissions, lastYear ?? 2025);

  return {
    nation,
    loading: nationLoading || climateTraceLoading,
    error: nationError || climateTraceError,
    sortedRegions,
    emissionsData,
    headerStats,
    lastYear,
    sectorEmissions,
    getSectorInfo,
    filteredSectors,
    setFilteredSectors,
    selectedYear,
    setSelectedYear,
    availableYears,
    currentYear,
  };
}
