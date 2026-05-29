import { DataItem, DataKPI, MapEntityType } from "@/types/rankings";
import {
  createStatisticalGradient,
  DEFAULT_STATISTICAL_GRADIENT_COLORS,
} from "@/utils/ui/colorGradients";
import { toMapRegionName } from "@/utils/regionUtils";

export const TERRITORY_MAP_COLORS = {
  null: "var(--grey)",
  ...DEFAULT_STATISTICAL_GRADIENT_COLORS,
} as const;

export type TerritoryKpi = DataKPI & {
  isBoolean?: boolean;
  booleanLabels?: { true: string; false: string };
  detailedDescription?: string;
  nullValues?: string;
};

export type TerritoryListEntry = {
  displayName: string;
  mapName: string;
  value: number | boolean | null;
  formattedValue: string;
  fillColor: string;
};

export function toTerritoryMapName(
  entityType: MapEntityType,
  displayName: string,
): string {
  return entityType === "regions" ? toMapRegionName(displayName) : displayName;
}

export function getTerritoryKpiRawValue(
  item: DataItem,
  kpiKey: string,
): number | boolean | null {
  const rawValue = item[kpiKey];

  if (typeof rawValue === "number" || typeof rawValue === "boolean") {
    return rawValue;
  }

  if (rawValue === null || rawValue === undefined) {
    return null;
  }

  const numericValue = Number(rawValue);
  return Number.isFinite(numericValue) ? numericValue : null;
}

export function extractTerritoryKpiNumericValues(
  data: DataItem[],
  kpiKey: string,
): number[] {
  return data
    .map((item) => getTerritoryKpiRawValue(item, kpiKey))
    .filter((value): value is number => typeof value === "number");
}

export function getTerritoryMapFillColor(
  value: number | boolean | null,
  values: number[],
  kpi: Pick<TerritoryKpi, "higherIsBetter" | "isBoolean">,
  colors: typeof TERRITORY_MAP_COLORS = TERRITORY_MAP_COLORS,
): string {
  if (
    value === null ||
    value === undefined ||
    values.length === 0 ||
    (typeof value === "number" && Number.isNaN(value))
  ) {
    return colors.null;
  }

  if (typeof value === "boolean") {
    return value === true ? colors.gradientEnd : colors.gradientMidLow;
  }

  return createStatisticalGradient(
    values,
    value,
    kpi.higherIsBetter ?? false,
    colors,
  );
}

export function formatTerritoryKpiValue(
  value: number | boolean | null | undefined,
  kpi: TerritoryKpi,
  fallbackNullLabel = "–",
): string {
  if (value === null || value === undefined) {
    return kpi.nullValues ?? fallbackNullLabel;
  }

  if (typeof value === "boolean" && kpi.isBoolean && kpi.booleanLabels) {
    return value ? kpi.booleanLabels.true : kpi.booleanLabels.false;
  }

  if (typeof value === "number") {
    const formatted = value.toFixed(1);
    return kpi.unit ? `${formatted} ${kpi.unit}` : formatted;
  }

  return String(value);
}

export function findTerritoryMapDataItem(
  data: DataItem[],
  displayName: string,
  mapName: string,
): DataItem | undefined {
  const displayKey = displayName.toLowerCase();
  const mapKey = mapName.toLowerCase();

  return data.find((item) => {
    const itemDisplayName =
      typeof item.displayName === "string"
        ? item.displayName.toLowerCase()
        : null;
    const itemName = item.name.toLowerCase();

    return (
      itemDisplayName === displayKey ||
      itemName === mapKey ||
      itemName === displayKey
    );
  });
}

export function buildTerritoryListEntries(
  items: string[],
  entityType: MapEntityType,
  mapData: DataItem[],
  selectedKPI: TerritoryKpi,
): TerritoryListEntry[] {
  const numericValues = extractTerritoryKpiNumericValues(
    mapData,
    String(selectedKPI.key),
  );

  return items.map((displayName) => {
    const mapName = toTerritoryMapName(entityType, displayName);
    const dataItem = findTerritoryMapDataItem(mapData, displayName, mapName);
    const value = dataItem
      ? getTerritoryKpiRawValue(dataItem, String(selectedKPI.key))
      : null;

    return {
      displayName,
      mapName,
      value,
      formattedValue: formatTerritoryKpiValue(value, selectedKPI),
      fillColor: getTerritoryMapFillColor(value, numericValues, selectedKPI),
    };
  });
}
