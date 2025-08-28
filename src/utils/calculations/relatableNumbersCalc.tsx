export const emissionsToTshirts = (totalEmissions: number | null) => {
  //Cradle-to-grave average value
  const averageTshirtEmission = 6;

  if (totalEmissions === null) {
    return 0;
  }
  const totalEmissionsKg = totalEmissions * 1000;
  const numberTshirtsProduced = totalEmissionsKg / averageTshirtEmission;

  return numberTshirtsProduced;
};

export const emissionsToGasTank = (totalEmissions: number | null) => {
  const co2PerLiterGas = 2.35;
  const averageTankLiters = 50;
  const emissionPerTank = co2PerLiterGas * averageTankLiters;

  if (totalEmissions === null) {
    return 0;
  }
  const totalEmissionsKg = totalEmissions * 1000;
  const numberOfTanks = totalEmissionsKg / emissionPerTank;

  return numberOfTanks;
};
