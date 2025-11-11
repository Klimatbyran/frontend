export type Region = {
  id: string;
  name: string;
  emissions: number | null;
  historicalEmissionChangePercent: number | null;
  meetsParis: boolean | null;
  emissionsGapToParis: number | null;
};
