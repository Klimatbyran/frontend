import { formatEmissionsAbsolute } from "../formatting/localization";
import { SWEDISH_EMISSIONS_2024 } from "./general";
import type { ReportingPeriod } from "@/types/company";

export const calculatedNumberOfdeaths = (
  calculatedTotal: number,
  currentLanguage: "sv" | "en",
) => {
  const deathsPerMtCO2e = 226;
  const totalDeaths = (calculatedTotal / 1e6) * deathsPerMtCO2e;
  return {
    translationKey: "calculatedDeaths",
    comparisonNumber: formatEmissionsAbsolute(totalDeaths, currentLanguage),
  };
};

export const emissionsComparedToCitizen = (
  emissionsChange: number,
  currentLanguage: "sv" | "en",
) => {
  const citizenTotalEmission = 9; // tCO2e per Swedish citizen according to https://konsumtionskompassen.se/

  if (emissionsChange === null) return null;

  const comparisonNumber = Math.round(
    Math.abs(emissionsChange / citizenTotalEmission),
  );

  if (comparisonNumber >= 2) {
    return {
      comparisonNumber: formatEmissionsAbsolute(
        comparisonNumber,
        currentLanguage,
      ),
      translationKey: "citizens",
    };
  }
  return null;
};

export const calculateFlightsAroundGlobe = (
  emissionsChange: number,
  currentLanguage: "sv" | "en",
) => {
  if (emissionsChange === null) return null;

  const mockFlightsAroundGlobe = 12;

  return {
    translationKey: "flights",
    comparisonNumber: formatEmissionsAbsolute(
      mockFlightsAroundGlobe,
      currentLanguage,
    ),
  };
};

//Here we want to calculate using the selected year's total, not the cumulative total.
export const calculateSwedenShareEmissions = (
  reportingPeriods: ReportingPeriod[],
  currentLanguage: "sv" | "en",
) => {
  const periodForYear = reportingPeriods.find((period) =>
    period.endDate.startsWith("2024"),
  );
  const calculatedTotal = periodForYear?.emissions?.calculatedTotalEmissions;

  if (!calculatedTotal) return null;

  const calculatedTotalMtCO2e = calculatedTotal / 1e6;
  const swedenShare = calculatedTotalMtCO2e / SWEDISH_EMISSIONS_2024;
  return {
    translationKey: "shareSweden",
    comparisonNumber: formatEmissionsAbsolute(swedenShare, currentLanguage),
  };
};
