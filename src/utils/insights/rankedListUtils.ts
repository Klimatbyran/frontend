// Ranked List Utilities
//
// This file contains utilities for ranked entity list views (municipalities, regions, companies).
// It provides functions for:
// - Filtering entities by KPI validity
// - Calculating statistics (averages, counts, distributions)
// - Formatting data for display
// - Transforming KPI data for UI components
//
// This is kept together because:
// 1. These functions are always used together in insights panels
// 2. The logic is domain-specific to ranked/insights views
// 3. Single import location makes it easy to find and maintain all insights logic
// 4. Avoids over-complicating the codebase with excessive file splitting

import { t } from "i18next";
import { DataPoint, EntityWithKPIs, KPIValue } from "@/types/rankings";

export function isMissingRankedValue(
  value: unknown,
  selectedDataPoint: Pick<DataPoint<unknown>, "isBoolean">,
): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (selectedDataPoint.isBoolean) {
    return typeof value !== "boolean";
  }

  return typeof value !== "number" || Number.isNaN(value);
}

export interface EntityStatistics<T> {
  validData: T[];
  average: number;
  median: number;
  aboveAverageCount: number;
  belowAverageCount: number;
  nullCount: number;
  distributionStats: Array<{
    count: number;
    colorClass: string;
    label: string;
  }>;
  formattedAverage?: string;
  formattedMedian?: string;
}

/**
 * Filter valid data from entities based on KPI type
 */
export function filterValidData<T, KPI extends KPIValue<T> = KPIValue<T>>(
  entities: T[],
  selectedKPI: KPI,
  getValue: (entity: T) => unknown,
): T[] {
  return entities.filter((entity) => {
    const value = getValue(entity);
    return !isMissingRankedValue(value, selectedKPI);
  });
}

/**
 * Calculate statistics for entities based on KPI
 */
export function calculateEntityStatistics<
  T,
  KPI extends KPIValue<T> = KPIValue<T>,
>(
  entities: T[],
  selectedKPI: KPI,
  getValue: (entity: T) => unknown,
  entityType: "municipalities" | "companies" | "regions" = "municipalities",
): EntityStatistics<T> {
  const validData = filterValidData(entities, selectedKPI, getValue);

  // Extract and convert values for calculations
  const values = validData.map((entity) => {
    const value = getValue(entity);
    // Convert boolean to number for calculations if KPI is binary
    if (selectedKPI.isBoolean && typeof value === "boolean") {
      return value ? 1 : 0;
    }
    return value as number;
  });

  const average = values.reduce((sum, val) => sum + val, 0) / values.length;

  const sortedValues = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sortedValues.length / 2);
  const median =
    sortedValues.length % 2 === 0
      ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
      : sortedValues[mid];

  // For boolean KPIs, these counts have a different meaning
  const aboveAverageCount = selectedKPI.isBoolean
    ? values.filter((val) => val > 0).length // Count of "true" values
    : values.filter((val) => val > average).length;

  const belowAverageCount = selectedKPI.isBoolean
    ? values.filter((val) => val === 0).length // Count of "false" values
    : values.filter((val) => val < average).length;

  const nullCount = entities.filter((entity) => {
    const value = getValue(entity);
    return isMissingRankedValue(value, selectedKPI);
  }).length;

  const entityPlural = t("header." + entityType).toLowerCase();

  const aboveAverageLabel = t("rankedInsights.aboveAverage", {
    entityPlural,
  });
  const belowAverageLabel = t("rankedInsights.belowAverage", {
    entityPlural,
  });

  // Create distribution stats
  const distributionStats = [
    {
      count: aboveAverageCount,
      colorClass: selectedKPI.higherIsBetter ? "text-blue-3" : "text-pink-3",
      label: selectedKPI.isBoolean
        ? selectedKPI.booleanLabels?.true || t("yes")
        : aboveAverageLabel,
    },
    {
      count: belowAverageCount,
      colorClass: selectedKPI.higherIsBetter ? "text-pink-3" : "text-blue-3",
      label: selectedKPI.isBoolean
        ? selectedKPI.booleanLabels?.false || t("no")
        : belowAverageLabel,
    },
  ];

  const unit = selectedKPI.unit || "";
  const formattedAverage = selectedKPI.isBoolean
    ? undefined
    : `${average.toFixed(1)}${unit}`;
  const formattedMedian = selectedKPI.isBoolean
    ? undefined
    : `${median.toFixed(1)}${unit}`;

  return {
    validData,
    average,
    median,
    aboveAverageCount,
    belowAverageCount,
    nullCount,
    distributionStats,
    formattedAverage,
    formattedMedian,
  };
}

/**
 * Create source links from KPI
 * Accepts any KPIValue regardless of entity type
 */
export function createSourceLinks<T = EntityWithKPIs>(
  selectedKPI: KPIValue<T>,
) {
  return (
    selectedKPI.sourceUrls?.map((url, i) => ({
      url,
      label: Array.isArray(selectedKPI.source)
        ? selectedKPI.source[i] || ""
        : selectedKPI.source || "",
    })) || []
  );
}
