/**
 * Future Trend Calculations
 *
 * This module provides functions for calculating future emissions trends
 * and projections based on historical data.
 */

import { ChartData } from "@/types/emissions";
import { getValidData, getCurrentYear } from "./utils";
import {
  validateInputData,
  validateYearParameters,
  validateBaseYear,
  validateEndYear,
  withErrorHandling,
} from "@/utils/validation";
import type { FutureTrendResult, TrendCoefficients } from "./types";

/**
 * Generates future trend data from current year to end year.
 * This function uses provided trend coefficients for consistent trend calculations.
 * @returns FutureTrendResult object or null if data is invalid
 * @throws {Error} When data is invalid or parameters are invalid
 */
export const calculateFutureTrend = (
  data: ChartData[],
  lastYearWithData: number,
  currentYear: number,
  trendCoefficients: TrendCoefficients,
  endYear: number = 2050,
  baseYear?: number,
): FutureTrendResult | null => {
  return withErrorHandling(() => {
    validateInputData(data, "calculateFutureTrend");
    validateYearParameters(
      lastYearWithData,
      currentYear,
      "calculateFutureTrend",
    );
    validateBaseYear(baseYear, "calculateFutureTrend");
    validateEndYear(endYear, "calculateFutureTrend");

    const filteredData = getValidData(data);
    if (filteredData.length === 0) {
      return null;
    }

    // Use provided trend coefficients
    if (!trendCoefficients) {
      return null;
    }

    const { slope, intercept } = trendCoefficients;
    const trendData: Record<number, number> = {};
    let cumulativeEmissions = 0;

    // Generate trend data from lastYearWithData to end year (inclusive)
    for (let year = lastYearWithData; year <= endYear; year++) {
      const trendValue = slope * year + intercept;
      trendData[year] = Math.max(0, trendValue);
      cumulativeEmissions += trendData[year];
    }

    return {
      trendData,
      cumulativeEmissions,
      trendCoefficients,
    };
  }, "calculateFutureTrend");
};
