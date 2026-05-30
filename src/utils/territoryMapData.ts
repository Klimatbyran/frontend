import { DataItem } from "@/types/rankings";
import { toMapRegionName } from "@/utils/regionUtils";

type MunicipalityKpiApiItem = {
  name: string;
  meetsParis: boolean;
};

export function normalizeMunicipalityKpiApiItem<
  T extends MunicipalityKpiApiItem,
>(municipality: T): Omit<T, "meetsParis"> & { meetsParisGoal: boolean } {
  const { meetsParis, ...rest } = municipality;
  return { ...rest, meetsParisGoal: meetsParis };
}

export function toRegionMapDataItem(
  region: { name: string } & Record<string, unknown>,
): DataItem {
  const mapName = toMapRegionName(region.name);
  return {
    ...region,
    id: mapName,
    name: mapName,
    displayName: region.name,
  };
}

export function toMunicipalityMapDataItem(
  municipality: MunicipalityKpiApiItem & Record<string, unknown>,
): DataItem {
  return {
    ...normalizeMunicipalityKpiApiItem(municipality),
    id: municipality.name,
    name: municipality.name,
    displayName: municipality.name,
  };
}
