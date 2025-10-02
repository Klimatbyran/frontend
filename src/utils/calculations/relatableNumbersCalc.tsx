import { formatEmissionsAbsolute } from "../formatting/localization";

export const emissionsComparedToCitizen = (
  emissionsChange: number,
  currentLanguage: "sv" | "en",
) => {
  const citizenTotalEmission = 8; // tCO2e per person

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
      ...areaBurnt,
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
    { translationKey: "Stockholm", sqm: 188000000 },
    { translationKey: "Monaco", sqm: 2020000 },
    { translationKey: "FootballFields", sqm: 7140 },
    { translationKey: "TennisCourts", sqm: 261 },
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
