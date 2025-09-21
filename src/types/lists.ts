export interface DataPoint<T> {
  label: string;
  key: keyof T;
  unit?: string;
  description?: string;
  higherIsBetter: boolean;
  nullValues?: string;
  formatter?: (value: T[keyof T]) => string | React.ReactNode;
}
