/**
 * Trend Coefficient Calculations
 * 
 * This module provides functions for calculating linear regression coefficients
 * for trend analysis in emissions data.
 */

import { DataPoint } from "@/lib/calculations/trends/types";
import { calculateLinearRegression } from "@/lib/calculations/trends/regression";
import {
  getValidData,
} from "./utils";
import {
  validateInputData,
  validateBaseYear,
  withErrorHandling,
} from "@/utils/validation";
import type { TrendCoefficients } from "./types";

/**
 * Get regression points based on base year logic.
 * When baseYear is provided and different from the latest year, uses all data from baseYear onward.
 * Otherwise, uses the last two data points for regression.
 *
 * @param data - Array of data points with year and total values
 * @param baseYear - Optional base year for trend calculations
 * @returns Array of DataPoint objects for regression analysis
 */
function getRegressionPoints(
  data: { year: number; total: number | null | undefined }[],
  baseYear?: number,
): DataPoint[] {
  if (!Array.isArray(data)) {
    return [];
  }

  const validData = getValidData(data);
  if (validData.length === 0) {
    return [];
  }

  if (baseYear && baseYear !== Math.max(...validData.map((d) => d.year))) {
    return validData
      .filter((d) => d.year >= baseYear)
      .map((d) => ({ year: d.year, value: d.total }));
  } else {
    const sorted = validData.sort((a, b) => a.year - b.year);
    return sorted.slice(-2).map((d) => ({ year: d.year, value: d.total }));
  }
}

/**
 * Calculates trend coefficients (slope and intercept) for a given data set.
 * @returns TrendCoefficients object or null if regression cannot be calculated
 * @throws {Error} When data is invalid or baseYear is invalid
 */
export const calculateTrendCoefficients = (
  data: { year: number; total: number | null | undefined }[],
  baseYear?: number,
): TrendCoefficients | null => {
  return withErrorHandling(() => {
    validateInputData(data, "calculateTrendCoefficients");
    validateBaseYear(baseYear, "calculateTrendCoefficients");

    const regressionPoints = getRegressionPoints(data, baseYear);
    if (regressionPoints.length < 2) {
      return null;
    }

    const regression = calculateLinearRegression(regressionPoints);
    if (!regression) {
      return null;
    }

    return { slope: regression.slope, intercept: regression.intercept };
  }, "calculateTrendCoefficients");
};

/**
 * Calculates trend coefficients (slope and intercept) anchored to the last data point.
 * @returns TrendCoefficients object or null if regression cannot be calculated
 * @throws {Error} When data is invalid or baseYear is invalid
 */
export const calculateAnchoredTrendCoefficients = (
  data: { year: number; total: number | null | undefined }[],
  baseYear?: number,
): TrendCoefficients | null => {
  return withErrorHandling(() => {
    validateInputData(data, "calculateAnchoredTrendCoefficients");
    validateBaseYear(baseYear, "calculateAnchoredTrendCoefficients");

    const regressionPoints = getRegressionPoints(data, baseYear);
    if (regressionPoints.length < 2) {
      return null;
    }

    const regression = calculateLinearRegression(regressionPoints);
    if (!regression) {
      return null;
    }

    // Get the last actual data point
    const validData = getValidData(data);
    const lastYearWithData = Math.max(...validData.map((d) => d.year));
    const lastActualValue = validData.find(
      (d) => d.year === lastYearWithData,
    )?.total;

    if (lastActualValue === undefined) {
      return null;
    }

    // Use the slope from regression but calculate intercept to pass through last point
    const slope = regression.slope;
    const intercept = lastActualValue - slope * lastYearWithData;

    return { slope, intercept };
  }, "calculateAnchoredTrendCoefficients");
}; 