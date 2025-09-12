export const emissionsComparedToSweden = (totalEmissions: number) => {
  //Swedens total emissions 2023 tco2e
  const swedenTotalEmissions = 44200000;

  if (totalEmissions === null) {
    return 0;
  }
  const emissionsDifference = totalEmissions / swedenTotalEmissions;

  return emissionsDifference;
};

export const emissionsToForestFire = (totalEmissions: number) => {
  //Total productive forest land
  const totalForestedArea = 22500000;
  const averageCarbonPerHectar = 50;
  const carbonConversion = 44 / 12;

  const tco2ePerHectar = averageCarbonPerHectar * carbonConversion;
  const totalHectarBurnt = totalEmissions / tco2ePerHectar;
  const percentForestBurnt = (totalHectarBurnt / totalForestedArea) * 100;

  return percentForestBurnt;
};

const totalEmissionsToKg = (totalEmissionsTons: number) => {
  return totalEmissionsTons * 1000;
};
