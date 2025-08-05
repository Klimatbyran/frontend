/**
 * Main Approximated Data Generation Functions
 *
 * This module provides the primary functions for generating comprehensive
 * approximated data sets combining historical data, approximations, and future projections.
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
  validateEndYear,
  validateBaseYear,
  withErrorHandling,
} from "@/utils/validation";
import { calculateTrendCoefficients } from "./coefficients";
import { calculateApproximatedHistorical } from "./historical";
import { calculateFutureTrend } from "./future";
import { generateExponentialApproximatedData } from "./exponential";
import type {
  ApproximatedHistoricalResult,
  FutureTrendResult,
  TrendCoefficients,
  SophisticatedTrendMode,
} from "./types";

/**
 * Determines the value for a given year based on historical and future data.
 * This function is used to fill gaps in the data array for UI purposes.
 * @throws {Error} When year is invalid
 */
function determineApproximatedValue(
  year: number,
  lastYearWithData: number,
  currentYear: number,
  approximatedHistorical: ApproximatedHistoricalResult | null,
  futureTrend: FutureTrendResult | null,
): number | null {
  if (typeof year !== "number" || isNaN(year)) {
    throw new Error("determineApproximatedValue: Year must be a valid number");
  }

  if (year < lastYearWithData) {
    return null;
  }

  if (year <= currentYear && approximatedHistorical) {
    // Use approximated historical for gap years (including lastYearWithData)
    return approximatedHistorical.approximatedData[year] ?? null;
  } else if (year > currentYear && futureTrend) {
    // Use future trend for projection years
    return futureTrend.trendData[year] || null;
  }

  return null;
}

/**
 * Calculates the Paris Agreement line value (Carbon Law) for a given year.
 * This function is used to determine the carbon law line for a given year.
 * @throws {Error} When year or currentYear is invalid
 */
function calculateParisValueForYear(
  year: number,
  currentYear: number,
  approximatedHistorical: ApproximatedHistoricalResult | null,
  filteredData: { year: number; total: number }[],
  trendCoefficients: TrendCoefficients | null,
  baseYear?: number,
): number | null {
  if (year < currentYear) {
    return null;
  }

  const currentYearValue =
    approximatedHistorical?.approximatedData[currentYear] ||
    filteredData.find((d) => d.year === currentYear)?.total ||
    (() => {
      // New format: slope * (year - minYear) + intercept
      if (!trendCoefficients) return 0;
      const minYear = getMinYear(filteredData, baseYear);
      return (
        trendCoefficients.slope * (currentYear - minYear) +
        trendCoefficients.intercept
      );
    })();

  return calculateParisValue(year, currentYear, currentYearValue);
}

/**
 * Creates a ChartData object for the final output.
 * This function combines actual data, approximated values, and carbon law values.
 * @throws {Error} When year is invalid
 */
function createDataPoint(
  year: number,
  actualData: ChartData | undefined,
  approximatedValue: number | null,
  parisValue: number | null,
): ChartData {
  if (typeof year !== "number" || isNaN(year)) {
    throw new Error("createDataPoint: Year must be a valid number");
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
 * Generates sophisticated approximated data based on historical and future trends.
 * This function combines linear and exponential approximations to create a comprehensive data set.
 * @returns Array of ChartData objects or null if data is invalid
 * @throws {Error} When data is invalid or parameters are invalid
 */
export const generateSophisticatedApproximatedData = (
  data: ChartData[],
  endYear: number = 2050,
  mode: SophisticatedTrendMode = "linear",
  baseYear?: number,
): ChartData[] | null => {
  return withErrorHandling(() => {
    validateInputData(data, "generateSophisticatedApproximatedData");
    validateEndYear(endYear, "generateSophisticatedApproximatedData");

    if (mode !== "linear" && mode !== "exponential") {
      throw new Error(
        'generateSophisticatedApproximatedData: Mode must be "linear" or "exponential"',
      );
    }

    validateBaseYear(baseYear, "generateSophisticatedApproximatedData");

    const filteredData = getValidData(data);

    if (mode === "exponential") {
      return generateExponentialApproximatedData(data, endYear, baseYear);
    }
    // Default: linear
    if (filteredData.length < 2) {
      return null;
    }

    const lastYearWithData = Math.max(...filteredData.map((d) => d.year));
    const currentYear = getCurrentYear();

    // Calculate trend coefficients using base year logic
    const trendCoefficients = calculateTrendCoefficients(
      filteredData,
      baseYear,
    );
    if (!trendCoefficients) {
      return null;
    }

    // Calculate approximated historical data (fill gaps)
    const approximatedHistorical = calculateApproximatedHistorical(
      data,
      lastYearWithData,
      currentYear,
      trendCoefficients,
      baseYear,
    );

    // Calculate future trend projection
    const futureTrend = calculateFutureTrend(
      data,
      lastYearWithData,
      currentYear,
      trendCoefficients,
      endYear,
      baseYear,
    );

    if (!futureTrend) {
      return null;
    }

    // Generate comprehensive data array
    if (!data.length) return [];
    const firstYear = data[0]?.year;
    if (firstYear === undefined) return [];
    const allYears = generateYearRange(firstYear, endYear);

    return allYears.map((year) => {
      const actualData = data.find((d) => d.year === year);

      // Determine approximated value using helper function
      const approximatedValue = determineApproximatedValue(
        year,
        lastYearWithData,
        currentYear,
        approximatedHistorical,
        futureTrend,
      );

      // Calculate Paris line value (Carbon Law) using helper function
      const parisValue = calculateParisValueForYear(
        year,
        currentYear,
        approximatedHistorical,
        filteredData,
        trendCoefficients,
        baseYear,
      );

      // Create data point using helper function
      return createDataPoint(year, actualData, approximatedValue, parisValue);
    });
  }, "generateSophisticatedApproximatedData");
};
