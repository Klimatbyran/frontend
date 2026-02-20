import { formatEmissionsAbsolute } from "../formatting/localization";

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
 /*  const swedenTotalEmissions = 44.2; // mtCO2e
  const calculatedTotalMtCO2e = calculatedTotal / 1e6;
  return calculatedTotalMtCO2e / swedenTotalEmissions;
};  */

export const calculateTemperatureGauge = (reportingPeriods) => {
  const cumulativeTotalEmissions =
    calculateCumulativeEmissions(reportingPeriods);

  const totalEmissionGigatons = cumulativeTotalEmissions / 1e9;
  const mediumReference = 0.450257;
  /*     const minimumReference = 0.35;
  const maximumReference = 0.55;
  const lowShadeReference = 0.27;
  const highShadeReference = 0.63; */

  /*     const ssp19ReferenceBoundary = totalEmissionGigatons * minimumReference;
   */ const actualGlobalWarming = totalEmissionGigatons * mediumReference;
  /*     const ssp585ReferenceBoundary = totalEmissionGigatons * maximumReference;
  const lowShadeReferenceBoundary = totalEmissionGigatons * lowShadeReference;
  const highShadeReferenceBoundary =
    totalEmissionGigatons * highShadeReference;
*/

  return actualGlobalWarming;
};

const calculateCumulativeEmissions = (reportingPeriods) => {
  return reportingPeriods.reduce(
    (sum, period) => sum + (period.emissions?.calculatedTotalEmissions ?? 0),
    0,
  );
};
