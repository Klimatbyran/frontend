/**
 * Exponential Regression Functions
 *
 * This module provides functions for exponential regression analysis
 * and exponential trend calculations in emissions data.
 */

import { ChartData } from "@/types/emissions";
import { fitExponentialRegression } from "@/lib/calculations/trends/regression";
import {
  getValidData,
  getCurrentYear,
  generateYearRange,
  calculateParisValue,
  getRegressionPoints,
} from "./utils";
import {
  validateInputData,
  validateEndYear,
  validateBaseYear,
  withErrorHandling,
} from "@/utils/validation";
import type { ExponentialFit } from "./types";

/**
 * Calculates the scale factor for exponential regression to match the last actual data point.
 * @throws {Error} When exponential fit parameters or last year with data is invalid
 */
function calculateExponentialScale(
  expFit: ExponentialFit,
  lastYearWithData: number,
  lastActualValue: number | undefined,
): number {
  if (!expFit || typeof expFit.a !== "number" || typeof expFit.b !== "number") {
    throw new Error(
      "calculateExponentialScale: Invalid exponential fit parameters",
    );
  }

  if (typeof lastYearWithData !== "number" || isNaN(lastYearWithData)) {
    throw new Error(
      "calculateExponentialScale: Last year with data must be a valid number",
    );
  }

  const fitValueAtLast = expFit.a * Math.exp(expFit.b * lastYearWithData);
  return lastActualValue && fitValueAtLast
    ? lastActualValue / fitValueAtLast
    : 1;
}

/**
 * Creates a ChartData object for exponential approximation.
 * This function handles both historical and future projections.
 * @throws {Error} When year or scale is invalid
 */
function createExponentialDataPoint(
  year: number,
  actualData: ChartData | undefined,
  lastYearWithData: number,
  lastActualValue: number | undefined,
  expFit: ExponentialFit,
  scale: number,
  currentYear: number,
): ChartData {
  if (typeof year !== "number" || isNaN(year)) {
    throw new Error("createExponentialDataPoint: Year must be a valid number");
  }

  if (typeof scale !== "number" || isNaN(scale)) {
    throw new Error("createExponentialDataPoint: Scale must be a valid number");
  }

  let approximatedValue = null;

  if (year > lastYearWithData) {
    approximatedValue = scale * expFit.a * Math.exp(expFit.b * year);
    if (approximatedValue < 0) approximatedValue = 0;
  } else if (year === lastYearWithData) {
    approximatedValue = lastActualValue ?? null;
  }

  let parisValue = null;
  if (year >= currentYear) {
    const currentYearValue =
      scale * expFit.a * Math.exp(expFit.b * currentYear);
    parisValue = calculateParisValue(year, currentYear, currentYearValue);
  }

  return {
    year,
    total: actualData?.total,
    approximated: approximatedValue,
    carbonLaw: parisValue,
    isAIGenerated: actualData?.isAIGenerated,
    scope1: actualData?.scope1,
    scope2: actualData?.scope2,
    scope3: actualData?.scope3,
    scope3Categories: actualData?.scope3Categories,
    originalValues: actualData?.originalValues,
  };
}

/**
 * Generates approximated historical data using exponential regression.
 * This function fits an exponential curve to the data and projects it forward.
 * @returns Array of ChartData objects or null if data is invalid
 * @throws {Error} When data is invalid or parameters are invalid
 */
export const generateExponentialApproximatedData = (
  data: ChartData[],
  endYear: number = 2050,
  baseYear?: number,
): ChartData[] | null => {
  return withErrorHandling(() => {
    validateInputData(data, "generateExponentialApproximatedData");
    validateEndYear(endYear, "generateExponentialApproximatedData");
    validateBaseYear(baseYear, "generateExponentialApproximatedData");

    const filteredData = getValidData(data);

    const regressionPoints = getRegressionPoints(filteredData, baseYear);
    if (regressionPoints.length < 2) return null;

    // Get the actual last year with data from the full dataset
    const validData = getValidData(data);
    const lastYearWithData = Math.max(...validData.map((d) => d.year));
    const lastActualValue = validData.find(
      (d) => d.year === lastYearWithData,
    )?.total;
    const currentYear = getCurrentYear();

    const expFit = fitExponentialRegression(regressionPoints);
    if (!expFit) return null;

    // Calculate scale using helper function
    const scale = calculateExponentialScale(
      expFit,
      lastYearWithData,
      lastActualValue,
    );

    if (!data.length) return [];
    const firstYear = data[0]?.year;
    if (firstYear === undefined) return [];

    const allYears = generateYearRange(firstYear, endYear);

    return allYears.map((year) => {
      const actualData = data.find((d) => d.year === year);
      return createExponentialDataPoint(
        year,
        actualData,
        lastYearWithData,
        lastActualValue,
        expFit,
        scale,
        currentYear,
      );
    });
  }, "generateExponentialApproximatedData");
};
