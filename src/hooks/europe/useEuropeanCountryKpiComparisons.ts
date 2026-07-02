import { useMemo } from "react";
import { EuropeanCountryDetails } from "@/hooks/europe/useEuropeanCountryDetails";
import { useEuropeanKpiAverages } from "@/hooks/europe/useEuropeanKpiAverages";

export type EuropeanCountryKpiComparison = {
  countryValue: number;
  averageValue: number;
};

export type EuropeanCountryKpiComparisons = {
  changeSince2015: EuropeanCountryKpiComparison | null;
  totalEmissions: (EuropeanCountryKpiComparison & { year: number }) | null;
  emissionsPerCapita: EuropeanCountryKpiComparison | null;
};

export function useEuropeanCountryKpiComparisons(
  country: EuropeanCountryDetails | null,
  lastYear: number | undefined,
): EuropeanCountryKpiComparisons | null {
  const averages = useEuropeanKpiAverages();

  return useMemo(() => {
    if (!country || !lastYear) {
      return null;
    }

    const lastYearEmissions = country.emissionsByYear[lastYear];
    if (typeof lastYearEmissions !== "number") {
      return null;
    }

    const changeSince2015 =
      typeof country.historicalEmissionChangePercent === "number" &&
      typeof averages.historicalEmissionChangePercent === "number"
        ? {
            countryValue: country.historicalEmissionChangePercent,
            averageValue: averages.historicalEmissionChangePercent,
          }
        : null;

    const totalEmissions =
      typeof averages.totalEmissions2025 === "number"
        ? {
            countryValue: lastYearEmissions,
            averageValue: averages.totalEmissions2025,
            year: lastYear,
          }
        : null;

    const emissionsPerCapita =
      typeof country.emissionsPerCapita === "number" &&
      typeof averages.emissionsPerCapita === "number"
        ? {
            countryValue: country.emissionsPerCapita,
            averageValue: averages.emissionsPerCapita,
          }
        : null;

    if (!changeSince2015 && !totalEmissions && !emissionsPerCapita) {
      return null;
    }

    return {
      changeSince2015,
      totalEmissions,
      emissionsPerCapita,
    };
  }, [averages, country, lastYear]);
}
