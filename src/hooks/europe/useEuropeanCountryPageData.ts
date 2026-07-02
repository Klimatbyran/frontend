import { useMemo } from "react";
import {
  useEuropeanCountryDetails,
  useEuropeanCountryDetailHeaderStats,
} from "@/hooks/europe/useEuropeanCountryDetails";
import { transformEuropeanCountryEmissionsData } from "@/utils/europe/emissionsTransforms";

export function useEuropeanCountryPageData(countryId: string | undefined) {
  const { country, loading, error } = useEuropeanCountryDetails(countryId);

  const emissionsData = useMemo(
    () =>
      country
        ? transformEuropeanCountryEmissionsData(country.emissionsByYear)
        : [],
    [country],
  );

  const lastYearEmissions = useMemo(() => {
    return emissionsData
      .filter((point) => point.total !== undefined)
      .sort((a, b) => b.year - a.year)[0];
  }, [emissionsData]);

  const lastYear = lastYearEmissions?.year;
  const headerStats = useEuropeanCountryDetailHeaderStats(country, lastYear);

  return {
    country,
    loading,
    error,
    emissionsData,
    headerStats,
  };
}
