/**
 * Simple Approximation Functions
 *
 * This module provides simplified approximation logic for basic use cases.
 * These functions are less sophisticated than the main generator functions
 * but are faster and easier to understand.
 */

import { ChartData } from "@/types/emissions";
import {
  getValidData,
  getCurrentYear,
  generateYearRange,
  calculateParisValue,
  getMinYear,
} from "./utils";
import {
  validateInputData,
  validateRegressionParameters,
  validateEndYear,
  validateBaseYear,
  withErrorHandling,
} from "@/utils/validation";

/**
 * Generates a single data point approximation for a given data set.
 * This function is useful when there is only one data point available.
 * @throws {Error} When data or filteredData is invalid or endYear is invalid
 */
function generateSingleDataPointApproximation(
  data: ChartData[],
  filteredData: { year: number; total: number }[],
  endYear: number,
): ChartData[] {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(
      "generateSingleDataPointApproximation: Data array must be non-empty",
    );
  }

  if (!Array.isArray(filteredData) || filteredData.length === 0) {
    throw new Error(
      "generateSingleDataPointApproximation: Filtered data array must be non-empty",
    );
  }

  if (typeof endYear !== "number" || isNaN(endYear)) {
    throw new Error(
      "generateSingleDataPointApproximation: End year must be a valid number",
    );
  }

  const currentYear = getCurrentYear();
  const firstYear = filteredData[0].year;
  const allYears = generateYearRange(firstYear, endYear);

  return allYears.map((year) => {
    let parisValue = null;
    if (year >= currentYear) {
      const currentYearValue = filteredData[0].total;
      parisValue = calculateParisValue(year, currentYear, currentYearValue);
    }
    return {
      year,
      approximated: null,
      total: data.find((d) => d.year === year)?.total,
      carbonLaw: parisValue,
    };
  });
}

/**
 * Calculates regression parameters (slope and intercept) from an array of points.
 * This function is used to determine the trend line for linear approximation.
 * @returns Regression parameters (slope, intercept)
 * @throws {Error} When points is invalid or regression parameters are invalid
 */
function calculateRegressionParameters(
  points: { year: number; total: number }[],
  regression?: { slope: number; intercept: number },
): { slope: number; intercept: number } {
  if (!Array.isArray(points)) {
    throw new Error("calculateRegressionParameters: Points must be an array");
  }

  validateRegressionParameters(regression, "calculateRegressionParameters");

  if (
    regression &&
    typeof regression.slope === "number" &&
    typeof regression.intercept === "number"
  ) {
    return { slope: regression.slope, intercept: regression.intercept };
  }

  if (points.length > 1) {
    let totalChange = 0;
    let totalYears = 0;
    for (let i = 1; i < points.length; i++) {
      totalChange += points[i].total - points[i - 1].total;
      totalYears += points[i].year - points[i - 1].year;
    }
    const slope = totalYears !== 0 ? totalChange / totalYears : 0;
    // Anchor at last point
    const intercept =
      points[points.length - 1].total - slope * points[points.length - 1].year;
    return { slope, intercept };
  }

  return { slope: 0, intercept: 0 };
}

/**
 * Creates a ChartData object for approximated historical data.
 * This function is used to fill gaps in the data array for linear approximation.
 * @throws {Error} When year, lastValue, slope, or intercept is invalid
 */
function createApproximatedDataPoint(
  year: number,
  data: ChartData[],
  lastYearWithData: number,
  lastValue: number,
  slope: number,
  intercept: number,
  points: { year: number; total: number }[],
  baseYear?: number,
): ChartData {
  if (typeof year !== "number" || isNaN(year)) {
    throw new Error("createApproximatedDataPoint: Year must be a valid number");
  }

  if (typeof lastValue !== "number" || isNaN(lastValue)) {
    throw new Error(
      "createApproximatedDataPoint: Last value must be a valid number",
    );
  }

  if (typeof slope !== "number" || isNaN(slope)) {
    throw new Error(
      "createApproximatedDataPoint: Slope must be a valid number",
    );
  }

  if (typeof intercept !== "number" || isNaN(intercept)) {
    throw new Error(
      "createApproximatedDataPoint: Intercept must be a valid number",
    );
  }

  let approximatedValue = null;
  if (year > lastYearWithData) {
    const minYear = getMinYear(points, baseYear);
    approximatedValue = slope * (year - minYear) + intercept;
    if (approximatedValue < 0) approximatedValue = 0;
  } else if (year === lastYearWithData) {
    approximatedValue = lastValue;
  }

  let parisValue = null;
  const currentYear = getCurrentYear();
  if (year >= currentYear) {
    const minYear = getMinYear(points, baseYear);
    const currentYearValue = slope * (currentYear - minYear) + intercept;
    parisValue = calculateParisValue(year, currentYear, currentYearValue);
  }

  return {
    year,
    approximated: approximatedValue,
    total: data.find((d) => d.year === year)?.total,
    carbonLaw: parisValue,
  };
}

/**
 * Generates approximated data using a linear trend.
 * This function is a simplified version of generateSophisticatedApproximatedData.
 * @returns Array of ChartData objects for the projection period
 * @throws {Error} When data is invalid or parameters are invalid
 */
export const generateApproximatedData = (
  data: ChartData[],
  regression?: { slope: number; intercept: number },
  endYear: number = 2030,
  baseYear?: number,
): ChartData[] => {
  return (
    withErrorHandling(() => {
      validateInputData(data, "generateApproximatedData");
      validateRegressionParameters(regression, "generateApproximatedData");
      validateEndYear(endYear, "generateApproximatedData");
      validateBaseYear(baseYear, "generateApproximatedData");

      const filteredData = getValidData(data);

      // If we have no valid data, return empty array
      if (filteredData.length === 0) return [];

      // If we have only one data point, we can still generate carbon law line
      if (filteredData.length < 2) {
        return generateSingleDataPointApproximation(
          data,
          filteredData,
          endYear,
        );
      }

      // If base year is null/undefined, use last two data points
      const baseYearValue = baseYear
        ? baseYear
        : filteredData.length >= 2
          ? filteredData[filteredData.length - 2].year
          : filteredData[0]?.year;

      if (baseYearValue === undefined) return [];
      const points = filteredData.filter((d) => d.year >= baseYearValue);

      // Calculate regression parameters using helper function
      const { slope, intercept } = calculateRegressionParameters(
        points,
        regression,
      );

      const lastYearWithData =
        points.length > 0
          ? points[points.length - 1].year
          : filteredData[filteredData.length - 1].year;
      const lastValue =
        points.length > 0
          ? points[points.length - 1].total
          : filteredData[filteredData.length - 1].total;

      // More robust checks for data array
      if (!data.length) return [];
      if (!data[0] || data[0].year === undefined) return [];

      const firstYear = data[0].year;
      const allYears = Array.from(
        { length: endYear - firstYear + 1 },
        (_, i) => firstYear + i,
      );

      return allYears.map((year) =>
        createApproximatedDataPoint(
          year,
          data,
          lastYearWithData,
          lastValue,
          slope,
          intercept,
          points,
          baseYear,
        ),
      );
    }, "generateApproximatedData") || []
  );
};
