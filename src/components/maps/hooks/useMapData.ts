import { useMemo } from "react";
import { DataItem, DataKPI } from "../TerritoryMap";

export function useMapData(data: DataItem[], selectedKPI: DataKPI) {
  const values = useMemo(() => {
    if (!selectedKPI) {
      return [];
    }

    return data
      .map((item) => item[selectedKPI.key])
      .filter(
        (val): val is number | string => val !== null && val !== undefined,
      )
      .map(Number)
      .filter((val) => Number.isFinite(val));
  }, [data, selectedKPI]);

  const minValue = values.length ? Math.min(...values) : 0;
  const maxValue = values.length ? Math.max(...values) : 0;

  const sortedData = useMemo(() => {
    if (!selectedKPI) {
      return [];
    }

    return [...data].sort((a, b) => {
      const aVal = a[selectedKPI.key];
      const bVal = b[selectedKPI.key];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const numericA = Number(aVal) || 0;
      const numericB = Number(bVal) || 0;

      return selectedKPI.higherIsBetter
        ? numericB - numericA
        : numericA - numericB;
    });
  }, [data, selectedKPI]);

  return {
    values,
    minValue,
    maxValue,
    sortedData,
  };
}
