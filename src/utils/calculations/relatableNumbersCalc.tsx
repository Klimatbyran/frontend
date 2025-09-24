export const emissionsComparedToSweden = (totalEmissions: number) => {
  //Swedens total emissions 2023 tco2e
  const swedenTotalEmissions = 44200000;

  //Malmö total emissions 2023 tco2e
  const malmöTotalEmissions = 685951;

  if (totalEmissions === null) {
    return 0;
  }

  let emissionsDifference = totalEmissions / swedenTotalEmissions;

  if (emissionsDifference < 1.5) {
    emissionsDifference = totalEmissions / malmöTotalEmissions;

    return emissionsDifference;
  }

  return emissionsDifference;
};

export const calculateAreaBurnt = (totalEmissions: number) => {
  const averageCarbonPerHectar = 50;
  const carbonConversion = 44 / 12;
  const tco2ePerHectar = averageCarbonPerHectar * carbonConversion;

  const totalHectarBurnt = totalEmissions / tco2ePerHectar;

  const areaBurnt =
    calculateStockholmsBurnt(totalHectarBurnt) ||
    calculateBurlovsBurnt(totalHectarBurnt) ||
    calculateFootballFieldsBurnt(totalHectarBurnt) ||
    calculateTennisCourtsBurnt(totalHectarBurnt);

  return areaBurnt;
};

const calculateStockholmsBurnt = (totalHectarBurnt: number) => {
  const stockholmSqm = 188000000;

  const stockholmsBurnt = Math.round((totalHectarBurnt * 10000) / stockholmSqm);

  if (stockholmsBurnt < 1) {
    return null;
  }
  return { area: "Stockholm", comparissonNumber: stockholmsBurnt };
};

const calculateBurlovsBurnt = (totalHectarBurnt: number) => {
  const burlovSqm = 19200000;

  const burlovsBurnt = Math.round((totalHectarBurnt * 10000) / burlovSqm);

  if (burlovsBurnt < 1) {
    return null;
  }
  return { area: "Burlov", comparissonNumber: burlovsBurnt };
};

const calculateFootballFieldsBurnt = (totalHectarBurnt: number) => {
  const footballFieldSqm = 7140;

  const footballFieldsBurnt = Math.round(
    (totalHectarBurnt * 10000) / footballFieldSqm,
  );
  if (footballFieldsBurnt < 1) {
    return null;
  }

  return {
    area: footballFieldsBurnt > 1 ? "FootballField" : "FootballFields",
    comparissonNumber: footballFieldsBurnt,
  };
};

const calculateTennisCourtsBurnt = (totalHectarBurnt: number) => {
  const tennisCourtSqm = 261;

  const tennisCourtsBurnt = Math.round(
    (totalHectarBurnt * 10000) / tennisCourtSqm,
  );
  if (tennisCourtsBurnt < 1) {
    return null;
  }

  return {
    area: tennisCourtsBurnt > 1 ? "TennisCourts" : "TennisCourt",
    comparissonNumber: tennisCourtsBurnt,
  };
};
