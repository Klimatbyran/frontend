import { useMemo } from "react";
import type { ColorFunction } from "@/types/visualizations";

/**
 * Shared hook for preparing data for beeswarm visualizations
 * Handles common pattern of filtering, calculating min/max, and creating color functions
 */
export function useBeeswarmData<T>(
  data: T[],
  getValue: (item: T) => number | null | undefined,
  createColorFunction: (min: number, max: number) => ColorFunction,
) {
  // Filter valid data and calculate values
  const { valid, invalid, values } = useMemo(() => {
    const validItems: T[] = [];
    const invalidItems: T[] = [];
    const numericValues: number[] = [];

    data.forEach((item) => {
      const value = getValue(item);
      if (value === null || value === undefined || isNaN(value)) {
        invalidItems.push(item);
      } else {
        validItems.push(item);
        numericValues.push(value);
      }
    });

    return {
      valid: validItems,
      invalid: invalidItems,
      values: numericValues,
    };
  }, [data, getValue]);

  // Calculate min/max
  const min = useMemo(
    () => (values.length ? Math.min(...values) : 0),
    [values],
  );
  const max = useMemo(
    () => (values.length ? Math.max(...values) : 0),
    [values],
  );

  // Create color function
  const colorForValue = useMemo(
    () => createColorFunction(min, max),
    [min, max, createColorFunction],
  );

  return {
    valid,
    invalid,
    values,
    min,
    max,
    colorForValue,
  };
}
