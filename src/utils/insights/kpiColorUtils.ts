import {
  createSymmetricRangeGradient,
} from "@/utils/ui/colorGradients";
import {
  DEFAULT_BOOLEAN_DATA_COLORS,
  DEFAULT_NULL_DATA_COLOR,
} from "../ui/colors";

export function createSymmetricKPIColorGetter<T>(
  entities: T[],
  kpiKey: keyof T,
) {
  const values = entities
    .filter((entity) => typeof entity[kpiKey] === "number")
    .map((entity) => entity[kpiKey] as number);

  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;

  return (entitiy: T) => {
    const value = entitiy[kpiKey];
    return value === null || value === undefined
      ? DEFAULT_NULL_DATA_COLOR
      : createSymmetricRangeGradient(min, max, value as number);
  };
}

export function createBooleanKPIColorGetter<T>(
  kpiKey: keyof T,
  higherIsBetter = true,
): (entities: T[]) => (entity: T) => string {
  return () => (entity: T) => {
    const value = entity[kpiKey];
    if (value === null || value === undefined || typeof value !== "boolean") {
      return DEFAULT_NULL_DATA_COLOR;
    }

    return value === higherIsBetter
      ? DEFAULT_BOOLEAN_DATA_COLORS.positive
      : DEFAULT_BOOLEAN_DATA_COLORS.negative;
  };
}
