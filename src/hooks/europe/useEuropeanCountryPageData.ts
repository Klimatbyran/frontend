import { useMemo } from "react";
import {
  useEuropeanCountryDetails,
  useEuropeanCountryDetailHeaderStats,
} from "@/hooks/europe/useEuropeanCountryDetails";
import { useEuropeanCountryKpiComparisons } from "@/hooks/europe/useEuropeanCountryKpiComparisons";
import { transformEuropeanCountryEmissionsData } from "@/utils/europe/emissionsTransforms";
import {
  CLIMATE_TRACE_REPORTED_END_YEAR,
  getClimateTraceReportedEndYear,
} from "@/utils/europe/climateTraceKpis";

export function useEuropeanCountryPageData(countryId: string | undefined) {
  const { country, loading, error } = useEuropeanCountryDetails(countryId);

  const emissionsData = useMemo(
    () =>
      country
        ? transformEuropeanCountryEmissionsData(country.emissionsByYear)
        : [],
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

  const headerStats = useEuropeanCountryDetailHeaderStats(country, lastYear);
  const kpiComparisons = useEuropeanCountryKpiComparisons(country, lastYear);

  return {
    country,
    loading,
    error,
    emissionsData,
    headerStats,
    kpiComparisons,
    lastYear,
  };
}
