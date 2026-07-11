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
import { EntityWithKPIs, KPIValue } from "@/types/rankings";
import {
  createStatisticalGradient,
  DEFAULT_STATISTICAL_GRADIENT_COLORS,
} from "../ui/colorGradients";
import {
  DEFAULT_BOOLEAN_DATA_COLORS,
  DEFAULT_NULL_DATA_COLOR,
} from "../ui/colors";

export function isMissingRankedValue(
  value: unknown,
  isBoolean: boolean | undefined,
): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (isBoolean) {
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
    return !isMissingRankedValue(value, selectedKPI.isBoolean);
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
    return isMissingRankedValue(value, selectedKPI.isBoolean);
  }).length;

  const entityPlural = t("header." + entityType).toLowerCase();

  const aboveAverageLabel = t("rankedInsights.aboveAverage", {
    entityPlural,
  });
  const belowAverageLabel = t("rankedInsights.belowAverage", {
    entityPlural,
  });

  const kpiKey = String(selectedKPI.key);

  // Create distribution stats
  const distributionStats = [
    {
      count: aboveAverageCount,
      colorClass: selectedKPI.higherIsBetter ? "text-blue-3" : "text-pink-3",
      label: selectedKPI.isBoolean
        ? t(`${entityType}.list.kpis.${kpiKey}.booleanLabels.true`)
        : aboveAverageLabel,
    },
    {
      count: belowAverageCount,
      colorClass: selectedKPI.higherIsBetter ? "text-pink-3" : "text-blue-3",
      label: selectedKPI.isBoolean
        ? t(`${entityType}.list.kpis.${kpiKey}.booleanLabels.false`)
        : belowAverageLabel,
    },
  ];

  if (selectedKPI.isBoolean && nullCount > 0) {
    distributionStats.push({
      count: nullCount,
      colorClass: "text-grey",
      label: t(`${entityType}.list.kpis.${kpiKey}.nullValues`, {
        defaultValue: t("unknown"),
      }),
    });
  }

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
  hrefResolver?: string | ((item: T) => string | undefined),
): { topPerformer?: PerformerResult; bottomPerformer?: PerformerResult } {
  if (kpi.isBoolean || !sortedData.length) return {};
  const unit = kpi.unit || "";
  const fmt = (item: T) => `${(item[kpi.key] as number)?.toFixed(1)}${unit}`;
  const getHref = (item: T): string | undefined => {
    if (!hrefResolver) return undefined;
    if (typeof hrefResolver === "function") return hrefResolver(item);
    return `${hrefResolver}/${item.name.toLowerCase()}`;
  };
  const best = sortedData[0];
  const worst = sortedData[sortedData.length - 1];
  return {
    topPerformer: best
      ? {
          name: best.name,
          value: fmt(best),
          href: getHref(best),
        }
      : undefined,
    bottomPerformer:
      worst && worst !== best
        ? {
            name: worst.name,
            value: fmt(worst),
            href: getHref(worst),
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

export function createDefaultColorGetter<T>(
  entities: T[],
  dataPointKey: keyof T,
  dataPointIsBoolean: boolean | undefined,
  dataPointHigherIsBetter: boolean,
) {
  const numericalValues = entities
    .filter(
      (entity) =>
        typeof entity[dataPointKey] === "number" &&
        !isNaN(entity[dataPointKey] as number),
    )
    .map((entity) => entity[dataPointKey] as number);

  return (entity: T) => {
    const value = entity[dataPointKey];

    if (isMissingRankedValue(value, dataPointIsBoolean))
      return DEFAULT_NULL_DATA_COLOR;

    if (dataPointIsBoolean) {
      return value == dataPointHigherIsBetter
        ? DEFAULT_BOOLEAN_DATA_COLORS.positive
        : DEFAULT_BOOLEAN_DATA_COLORS.negative;
    }

    return createStatisticalGradient(
      numericalValues,
      value as number,
      dataPointHigherIsBetter ?? false,
      DEFAULT_STATISTICAL_GRADIENT_COLORS,
    );
  };
}
