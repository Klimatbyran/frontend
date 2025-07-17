/**
 * Historical Data Calculations
 *
 * This module provides functions for calculating approximated historical data
 * to fill gaps between reported years and the current year.
 */

import { ChartData } from "@/types/emissions";
import { getValidData } from "./utils";
import {
  validateInputData,
  validateYearParameters,
  validateBaseYear,
  withErrorHandling,
} from "@/utils/validation";
import { calculateAnchoredTrendCoefficients } from "./coefficients";
import type { ApproximatedHistoricalResult } from "./types";

/**
 * Generates approximated historical data based on the last reported year and a current year.
 * This function uses anchored trend coefficients to avoid visual "humps" in the data.
 * @returns ApproximatedHistoricalResult object or null if data is invalid
 * @throws {Error} When data is invalid or parameters are invalid
 */
export const calculateApproximatedHistorical = (
  data: ChartData[],
  lastYearWithData: number,
  currentYear: number,
  baseYear?: number,
): ApproximatedHistoricalResult | null => {
  return withErrorHandling(() => {
    validateInputData(data, "calculateApproximatedHistorical");
    validateYearParameters(
      lastYearWithData,
      currentYear,
      "calculateApproximatedHistorical",
    );
    validateBaseYear(baseYear, "calculateApproximatedHistorical");

    const filteredData = getValidData(data);
    if (filteredData.length === 0) {
      return null;
    }

    // Calculate trend coefficients using anchored method
    const trendCoefficients = calculateAnchoredTrendCoefficients(
      filteredData,
      baseYear,
    );
    if (!trendCoefficients) {
      return null;
    }

    const { slope, intercept } = trendCoefficients;
    const approximatedData: Record<number, number> = {};
    let cumulativeEmissions = 0;

    // Generate approximated data for years between lastYearWithData and currentYear
    // Include the last year with data as well
    for (let year = lastYearWithData; year <= currentYear; year++) {
      let approximatedValue;
      if (year === lastYearWithData) {
        // Use the actual value for the last year with data
        const lastActual = filteredData.find(
          (d) => d.year === lastYearWithData,
        )?.total;
        approximatedValue =
          lastActual !== undefined ? lastActual : slope * year + intercept;
      } else {
        approximatedValue = slope * year + intercept;
      }
      approximatedData[year] = Math.max(0, approximatedValue);

      // Only add to cumulative emissions for gap years (after lastYearWithData)
      if (year > lastYearWithData) {
        cumulativeEmissions += approximatedData[year];
      }
    }

    return {
      approximatedData,
      cumulativeEmissions,
      trendCoefficients,
    };
  }, "calculateApproximatedHistorical");
};
