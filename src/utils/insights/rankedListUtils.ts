// Ranked List Utilities

/** Default number of top/bottom entities shown in insight lists */
export const TOP_N = 10;
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
  aboveAverageCount: number;
  belowAverageCount: number;
  nullCount: number;
  distributionStats: Array<{
    count: number;
    colorClass: string;
    label: string;
  }>;
  formattedAverage?: string;
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

  return {
    validData,
    average,
    aboveAverageCount,
    belowAverageCount,
    nullCount,
    distributionStats,
    formattedAverage,
  };
}

/**
 * Create source links from KPI
 * Accepts any KPIValue regardless of entity type
 */
interface PerformerResult {
  name: string;
  value: string;
  href?: string;
}

/**
 * Build top and bottom performer objects for KPIDetailsPanel.
 * Returns undefined for boolean KPIs or when data is too sparse.
 */
export function buildPerformerProps<T extends { name: string }>(
  sortedData: T[],
  kpi: { key: keyof T; unit?: string; isBoolean?: boolean },
  hrefPrefix?: string,
): { topPerformer?: PerformerResult; bottomPerformer?: PerformerResult } {
  if (kpi.isBoolean || !sortedData.length) return {};
  const unit = kpi.unit || "";
  const fmt = (item: T) => `${(item[kpi.key] as number)?.toFixed(1)}${unit}`;
  const best = sortedData[0];
  const worst = sortedData[sortedData.length - 1];
  return {
    topPerformer: best
      ? {
          name: best.name,
          value: fmt(best),
          href: hrefPrefix ? `${hrefPrefix}/${best.name.toLowerCase()}` : undefined,
        }
      : undefined,
    bottomPerformer:
      worst && worst !== best
        ? {
            name: worst.name,
            value: fmt(worst),
            href: hrefPrefix ? `${hrefPrefix}/${worst.name.toLowerCase()}` : undefined,
          }
        : undefined,
  };
}

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
