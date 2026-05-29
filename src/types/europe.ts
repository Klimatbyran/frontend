export type EuropeanCountry = {
  id: string;
  name: string;
  emissionsPerCapita: number | null;
  emissionsPercentChange: number | null;
  historicalEmissionChangePercent: number | null;
  meetsParis: boolean | null;
};
