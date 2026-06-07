import { formatEmissionsAbsolute } from "../formatting/localization";

/** tCO2e per Swedish citizen — https://konsumtionskompassen.se/ */
export const SWEDISH_CITIZEN_ANNUAL_EMISSIONS_TCO2E = 9;

export function emissionsToSwedishCitizenEquivalent(
  emissionsTonnes: number,
  currentLanguage: "sv" | "en",
) {
  const count = Math.round(
    emissionsTonnes / SWEDISH_CITIZEN_ANNUAL_EMISSIONS_TCO2E,
  );

  if (count < 2) {
    return null;
  }

  return {
    count,
    formattedCount: formatEmissionsAbsolute(count, currentLanguage),
  };
}

export const emissionsComparedToCitizen = (
  emissionsChange: number,
  currentLanguage: "sv" | "en",
) => {
  if (emissionsChange === null) return null;

  const equivalent = emissionsToSwedishCitizenEquivalent(
    Math.abs(emissionsChange),
    currentLanguage,
  );

  if (!equivalent) return null;

  return {
    comparisonNumber: equivalent.formattedCount,
    translationKey: "Citizens",
    prefix: "prefixEmissions",
  };
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
};
