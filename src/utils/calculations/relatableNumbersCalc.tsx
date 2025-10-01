import { formatEmissionsAbsolute } from "../formatting/localization";

export const emissionsComparedToCitizen = (
  emissionsChange: number,
  currentLanguage: "sv" | "en",
) => {
  const citizenTotalEmission = 8; // tCO2e per person

  if (emissionsChange === null) return null;

  const comparissonNumber = Math.round(
    Math.abs(emissionsChange / citizenTotalEmission),
  );

  return {
    comparissonNumber: formatEmissionsAbsolute(
      comparissonNumber,
      currentLanguage,
    ),
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

  const areaBurnt =
    calculateStockholmsBurnt(totalHectarBurnt) ||
    calculateMonacosBurnt(totalHectarBurnt) ||
    calculateFootballFieldsBurnt(totalHectarBurnt) ||
    calculateTennisCourtsBurnt(totalHectarBurnt);

  return {
    ...areaBurnt,
    comparissonNumber: formatEmissionsAbsolute(
      areaBurnt.comparissonNumber,
      currentLanguage,
    ),
    prefix: "prefixFire",
  };
};

const calculateStockholmsBurnt = (totalHectarBurnt: number) => {
  const stockholmSqm = 188000000;

  const stockholmsBurnt = Math.abs((totalHectarBurnt * 10000) / stockholmSqm);

  if (stockholmsBurnt < 2) {
    return null;
  }
  return {
    translationKey: "Stockholm",
    comparissonNumber: stockholmsBurnt,
  };
};

const calculateMonacosBurnt = (totalHectarBurnt: number) => {
  const monacoSqm = 2020000;

  const monacosBurnt = Math.abs((totalHectarBurnt * 10000) / monacoSqm);

  if (monacosBurnt < 2) {
    return null;
  }
  return { translationKey: "Monaco", comparissonNumber: monacosBurnt };
};

const calculateFootballFieldsBurnt = (totalHectarBurnt: number) => {
  const footballFieldSqm = 7140;

  const footballFieldsBurnt = Math.abs(
    (totalHectarBurnt * 10000) / footballFieldSqm,
  );
  if (footballFieldsBurnt < 2) {
    return null;
  }

  return {
    translationKey: "FootballFields",
    comparissonNumber: footballFieldsBurnt,
  };
};

const calculateTennisCourtsBurnt = (totalHectarBurnt: number) => {
  const tennisCourtSqm = 261;

  const tennisCourtsBurnt = Math.abs(
    (totalHectarBurnt * 10000) / tennisCourtSqm,
  );
  if (tennisCourtsBurnt < 2) {
    return null;
  }

  return {
    translationKey: "TennisCourts",
    comparissonNumber: tennisCourtsBurnt,
  };
};
