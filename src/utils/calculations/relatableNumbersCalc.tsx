const averageCarbonPerHectar = 50;
const carbonConversion = 44 / 12;

//Avg sqm of a footballfield
const footballFieldSqm = 7140;

//Size of Stockholm
const stockholmSqm = 188000000;

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

export const calculateStockholmsBurnt = (totalEmissions: number) => {
  const tco2ePerHectar = averageCarbonPerHectar * carbonConversion;
  const totalHectarBurnt = totalEmissions / tco2ePerHectar;

  const stockholmsBurnt = Math.round((totalHectarBurnt * 10000) / stockholmSqm);

  if (stockholmsBurnt < 2) {
    return null;
  }
  return stockholmsBurnt;
};

export const calculateBurntFootballFields = (totalEmissions: number) => {
  if (totalEmissions === null) {
    return 0;
  }
  const tco2ePerHectar = averageCarbonPerHectar * carbonConversion;
  const totalHectarBurnt = totalEmissions / tco2ePerHectar;

  const footballFieldsBurnt = Math.round(
    (totalHectarBurnt * 10000) / footballFieldSqm,
  );

  return footballFieldsBurnt;
};
