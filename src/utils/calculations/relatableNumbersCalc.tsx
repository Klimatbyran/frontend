export const emissionsComparedToSweden = (totalEmissions: number | null) => {
  //Swedens total emissions 2023 tco2e
  const swedenTotalEmissions = 44200000;

  //Malmö total emissions 2023 tco2e
  const malmöTotalEmissions = 685951;

  if (totalEmissions === null) {
    return 0;
  }

  let emissionsDifference = totalEmissions / swedenTotalEmissions;

  console.log(emissionsDifference);

  if (emissionsDifference < 1.5) {
    emissionsDifference = totalEmissions / malmöTotalEmissions;

    return emissionsDifference;
  }

  return emissionsDifference;
};

export const emissionsToForestFire = (totalEmissions: number | null) => {
  const averageCarbonPerHectar = 50;
  const carbonConversion = 44 / 12;

  //Avg sqm of a footballfield
  const footballFieldSqm = 7140;

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
