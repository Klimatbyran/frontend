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

export const emissionsComparedToSweden = (totalEmissions: number | null) => {
  //Swedens total emissions 2023 tco2e
  const swedenTotalEmissions = 44200000;

  if (totalEmissions === null) {
    return 0;
  }
  const emissionsDifference = totalEmissions / swedenTotalEmissions;

  return emissionsDifference;
};

export const emissionsToFlights = (totalEmissions: number | null) => {
  //Average 746kg tcoe2 for a Sweden-New York roundtrip
  const roundTrip = 746;

  if (totalEmissions === null) {
    return 0;
  }
  const totalEmissionsKg = totalEmissions * 1000;

  const numberOfRoundTrips = totalEmissionsKg / roundTrip;

  return numberOfRoundTrips;
};
