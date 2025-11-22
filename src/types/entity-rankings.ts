import { Municipality } from "./municipality";
import { Region } from "./region";

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

/**
 * Generic KPI value type that can be used for any entity type
 * @template T - The entity type (Municipality, Region, CompanyWithKPIs, etc.)
 */
export interface KPIValue<T = Municipality | Region> {
  label: string;
  key: keyof T;
  unit: string;
  source: string;
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

export type SectorEmissions = {
  [year: string]: {
    [sector: string]: number;
  };
};
