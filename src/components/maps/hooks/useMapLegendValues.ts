import { useMemo } from "react";
import { DataItem, DataKPI } from "../TerritoryMap";

export function useMapLegendValues(
  data: DataItem[],
  selectedKPI: DataKPI,
  minValue: number,
  maxValue: number,
) {
  const leftValue = useMemo(
    () => (selectedKPI.higherIsBetter ? minValue : maxValue),
    [selectedKPI.higherIsBetter, minValue, maxValue],
  );

  const rightValue = useMemo(
    () => (selectedKPI.higherIsBetter ? maxValue : minValue),
    [selectedKPI.higherIsBetter, minValue, maxValue],
  );

  const hasNullValues = useMemo(
    () => data.some((item) => item[selectedKPI.key] === null),
    [data, selectedKPI.key],
  );

  return { leftValue, rightValue, hasNullValues };
}
