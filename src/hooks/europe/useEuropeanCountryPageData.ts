import { useMemo } from "react";
import { useHiddenItems } from "@/components/charts";
import {
  useEuropeanCountryDetails,
  useEuropeanCountryDetailHeaderStats,
} from "@/hooks/europe/useEuropeanCountryDetails";
import { useEuropeanCountryKpiComparisons } from "@/hooks/europe/useEuropeanCountryKpiComparisons";
import { useClimateTraceSectors } from "@/hooks/europe/useClimateTraceSectors";
import { useSectorYearSelection } from "@/hooks/territories/useSectorYearSelection";
import { transformEuropeanCountryEmissionsData } from "@/utils/europe/emissionsTransforms";
import { buildClimateTraceSectorEmissionsResponse } from "@/utils/europe/climateTraceSectors";
import {
  CLIMATE_TRACE_REPORTED_END_YEAR,
  getClimateTraceReportedEndYear,
} from "@/utils/europe/climateTraceKpis";

export function useEuropeanCountryPageData(countryId: string | undefined) {
  const { country, loading, error } = useEuropeanCountryDetails(countryId);
  const { getSectorInfo } = useClimateTraceSectors();
  const { hiddenItems: filteredSectors, setHiddenItems: setFilteredSectors } =
    useHiddenItems<string>([]);

  const emissionsData = useMemo(
    () =>
      country
        ? transformEuropeanCountryEmissionsData(country.emissionsByYear)
        : [],
    [country],
  );

  const sectorEmissions = useMemo(
    () =>
      country
        ? buildClimateTraceSectorEmissionsResponse(
            country.sectorEmissionsByYear,
          )
        : null,
    [country],
  );

  const lastYear = useMemo(() => {
    if (!country) {
      return undefined;
    }

    return (
      getClimateTraceReportedEndYear(
        country.emissionsByYear,
        CLIMATE_TRACE_REPORTED_END_YEAR,
      ) ?? undefined
    );
  }, [country]);

  const { selectedYear, setSelectedYear, availableYears, currentYear } =
    useSectorYearSelection(sectorEmissions, lastYear);

  const headerStats = useEuropeanCountryDetailHeaderStats(country, lastYear);
  const kpiComparisons = useEuropeanCountryKpiComparisons(country, lastYear);

  return {
    country,
    loading,
    error,
    emissionsData,
    sectorEmissions,
    getSectorInfo,
    filteredSectors,
    setFilteredSectors,
    selectedYear,
    setSelectedYear,
    availableYears,
    currentYear,
    headerStats,
    kpiComparisons,
    lastYear,
  };
}
