import { DataItem } from "@/components/maps/SwedenMap";

export type Region = {
  id: string;
  name: string;
  emissions: number | null;
  historicalEmissionChangePercent: number | null;
  meetsParis: boolean | null;
};

export type RegionListItem = DataItem & {
  mapName: string;
  displayName: string;
};
