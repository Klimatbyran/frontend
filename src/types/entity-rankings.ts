import { Municipality } from "./municipality";
import { Region } from "./region";

export interface DataPoint<T> {
  label: string;
  key: keyof T;
  unit?: string;
  description?: string;
  higherIsBetter: boolean;
  nullValues?: string;
  formatter?: (value: T[keyof T]) => string | React.ReactNode;
}

export interface KPIValue {
  label: string;
  key: keyof Municipality | keyof Region;
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
