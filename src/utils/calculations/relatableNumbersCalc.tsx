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
