import { formatEmissionsAbsolute } from "../formatting/localization";
import { SWEDISH_EMISSIONS_2024 } from "./general";
import type { ReportingPeriod } from "@/types/company";

type Values = {
  prefix: string;
  count: string;
  entity: string;
  [key: string]: string;
};

export const formatTranslationString = (pattern: string, values: Values) => {
  let formatted = pattern;

  for (const key in values) {
    formatted = formatted.split(`{{${key}}}`).join(values[key]);
  }

  return formatted;
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
      translationKey: "Citizens",
      prefix: "prefixEmissions",
    };
  }
  return null;
};

export const calculateAreaBurnt = (
  emissionsChange: number,
  currentLanguage: "sv" | "en",
) => {
  const averageCarbonPerHectar = 50;
  const carbonConversion = 44 / 12;
  const tco2ePerHectar = averageCarbonPerHectar * carbonConversion;

  const totalHectarBurnt = emissionsChange / tco2ePerHectar;

  const areaBurnt = burnComparison(totalHectarBurnt);

  if (areaBurnt) {
    return {
      translationKey: areaBurnt.translationKey,
      comparisonNumber: formatEmissionsAbsolute(
        areaBurnt.comparisonNumber,
        currentLanguage,
      ),
      prefix: "prefixFire",
    };
  }
  return null;
};

const burnComparison = (hectarBurnt: number) => {
  const burnAreas = [
    { translationKey: "stockholm", sqm: 188000000 },
    { translationKey: "monaco", sqm: 2020000 },
    { translationKey: "footballFields", sqm: 7140 },
    { translationKey: "tennisCourts", sqm: 261 },
  ].sort((a, b) => b.sqm - a.sqm);

  for (const { translationKey, sqm } of burnAreas) {
    const nrBurnt = Math.abs((hectarBurnt * 10000) / sqm);

    if (nrBurnt >= 2) {
      return {
        translationKey: translationKey,
        comparisonNumber: nrBurnt,
      };
    }
  }

  return null;
};

//Here we want to calculate using the selected year's total, not the cumulative total
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
    prefix: "prefixSwedenShare",
  };
};
