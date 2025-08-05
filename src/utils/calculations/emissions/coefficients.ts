/**
 * Trend Coefficient Calculations
 *
 * This module provides functions for calculating linear regression coefficients
 * for trend analysis in emissions data.
 */

import { DataPoint } from "@/lib/calculations/trends/types";
import { calculateLinearRegression } from "@/lib/calculations/trends/regression";
import { getValidData, getRegressionPoints } from "./utils";
import {
  validateInputData,
  validateBaseYear,
  withErrorHandling,
} from "@/utils/validation";
import type { TrendCoefficients } from "./types";

/**
 * Calculates trend coefficients (slope and intercept) for the given data.
 * Uses linear regression to find the best fit line.
 */
export const calculateTrendCoefficients = (
  data: { year: number; total: number }[],
  baseYear?: number,
): { slope: number; intercept: number } | null => {
  return withErrorHandling(() => {
    validateInputData(data, "calculateTrendCoefficients");
    validateBaseYear(baseYear, "calculateTrendCoefficients");

    if (data.length < 2) {
      return null;
    }

    // Filter data from base year onwards if specified
    const filteredData = baseYear
      ? data.filter((d) => d.year >= baseYear)
      : data;

    if (filteredData.length < 2) {
      return null;
    }

    // Convert to DataPoint format for calculateLinearRegression
    const dataPoints = filteredData.map((d) => ({
      year: d.year,
      value: d.total,
    }));

    // Calculate linear regression
    const result = calculateLinearRegression(dataPoints);

    if (!result) {
      return null;
    }

    return result;
  }, "calculateTrendCoefficients");
};
