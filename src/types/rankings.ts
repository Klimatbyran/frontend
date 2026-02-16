import { Municipality } from "./municipality";
import { Region } from "./region";
import { CompanyWithKPIs } from "./company";

export interface DataKPI {
  key: string;
  label: string;
  unit?: string;
  higherIsBetter?: boolean;
  format?: (value: number | string | boolean | null) => string;
}

export interface DataItem {
  id: string;
  name: string;
  [key: string]: string | number | boolean | null | undefined | Array<unknown>;
}

export interface DataPoint<T> {
  label: string;
  key: keyof T;
  unit?: string;
  description?: string;
  higherIsBetter: boolean;
  nullValues?: string;
  isBoolean?: boolean;
  booleanLabels?: { true: string; false: string };
  formatter?: (value: T[keyof T]) => string | React.ReactNode;
}

export type RankedListItem = DataItem & {
  mapName: string;
  displayName: string;
};

/**
 * Generic KPI value type that can be used for any entity type
 * @template T - The entity type (Municipality, Region, CompanyWithKPIs, etc.)
 */
export interface KPIValue<T = Municipality | Region> {
  label: string;
  key: keyof T;
  unit: string;
  source: string | string[];
  sourceUrls: string[];
  description: string;
  detailedDescription: string;
  nullValues?: string;
  higherIsBetter: boolean;
  isBoolean?: boolean;
  booleanLabels?: { true: string; false: string };
  belowString?: string;
  aboveString?: string;
}

export type MapEntityType = "municipalities" | "regions";
export type EntityWithKPIs = Municipality | Region | CompanyWithKPIs;
