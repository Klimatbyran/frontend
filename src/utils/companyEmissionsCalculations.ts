/**
 * Company Emissions Calculations
 *
 * This module provides functions for calculating emissions trends, projections, and approximations.
 *
 * TYPE USAGE PATTERNS:
 * - ChartData[]: For UI/charting functions (total is optional)
 * - { year: number; total: number | null | undefined }[]: For calculation utilities
 *
 * @example
 * ```typescript
 * const data = [
 *   { year: 2020, total: 100 },
 *   { year: 2021, total: 110 },
 *   { year: 2022, total: 120 }
 * ];
 *
 * // Basic usage
 * const trendCoefficients = calculateTrendCoefficients(data);
 * const approximatedData = generateSophisticatedApproximatedData(data);
 * ```
 */

import { ChartData } from "@/types/emissions";
import { DataPoint } from "@/lib/calculations/trends/types";
import {
  calculateLinearRegression,
  fitExponentialRegression,
} from "@/lib/calculations/trends/regression";
import {
  calculateTrapezoidalIntegration,
  generateYearRange,
  getCurrentYear,
  getValidData,
  getMinYear,
  calculateParisValue,
} from "./emissionsCalculationsUtils";
import {
  validateInputData,
  validateYearParameters,
  validateRegressionParameters,
  validateBaseYear,
  validateEndYear,
  withErrorHandling,
} from "./validation";

// Type definitions for better type safety
export interface TrendCoefficients {
  slope: number;
  intercept: number;
}

export interface ApproximatedHistoricalResult {
  approximatedData: Record<number, number>;
  cumulativeEmissions: number;
  trendCoefficients: TrendCoefficients;
}

export interface FutureTrendResult {
  trendData: Record<number, number>;
  cumulativeEmissions: number;
  trendCoefficients: TrendCoefficients;
}

export interface ExponentialFit {
  a: number;
  b: number;
}

/**
 * Available modes for sophisticated trend calculations.
 * - "linear": Uses linear regression for trend calculations
 * - "exponential": Uses exponential regression for trend calculations
 */
export type SophisticatedTrendMode = "linear" | "exponential";

// ============================================================================
// TREND COEFFICIENT CALCULATIONS
// ============================================================================
// These functions calculate linear regression coefficients for trend analysis.

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

// Base year-aware trend coefficients calculation
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

// Last-point anchored trend coefficients calculation
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

// ============================================================================
// HISTORICAL DATA CALCULATIONS
// ============================================================================
// These functions calculate approximated historical data to fill gaps between
// reported years and the current year.

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

    // Use anchored trend coefficients to avoid visual "humps"
    const trendCoefficients = calculateAnchoredTrendCoefficients(
      filteredData,
      baseYear,
    );
    if (!trendCoefficients) {
      return null;
    }

    // Include the last year with data as the starting point
    const approximatedYears = generateYearRange(lastYearWithData, currentYear);

    if (approximatedYears.length === 0) {
      return null;
    }

    const lastDataPoint = data.find((d) => d.year === lastYearWithData);
    if (!lastDataPoint?.total) {
      return null;
    }

    const approximatedData: Record<number, number> = {};

    for (const year of approximatedYears) {
      if (year === lastYearWithData) {
        // Use the actual value for the last reported year
        approximatedData[year] = lastDataPoint.total;
      } else {
        // Use the trend for subsequent years
        const minYear = getMinYear(filteredData, baseYear);
        const approximatedValue = Math.max(
          0,
          trendCoefficients.slope * (year - minYear) +
            trendCoefficients.intercept,
        );
        approximatedData[year] = approximatedValue;
      }
    }

    // Calculate cumulative emissions using trapezoidal integration
    const cumulativeEmissions =
      calculateTrapezoidalIntegration(approximatedData);

    return {
      approximatedData,
      cumulativeEmissions,
      trendCoefficients,
    };
  }, "calculateApproximatedHistorical");
};

// ============================================================================
// FUTURE TREND CALCULATIONS
// ============================================================================
// These functions project future emissions based on historical trends and
// calculate cumulative emissions for future periods.

/**
 * Generates future trend data based on the last reported year and a current year.
 * This function projects future values using trend coefficients.
 * @returns FutureTrendResult object or null if data is invalid
 * @throws {Error} When data is invalid or parameters are invalid
 */
export const calculateFutureTrend = (
  data: ChartData[],
  lastYearWithData: number,
  currentYear: number,
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
    validateEndYear(endYear, "calculateFutureTrend");
    validateBaseYear(baseYear, "calculateFutureTrend");

    const filteredData = getValidData(data);

    // Use anchored trend coefficients to avoid visual "humps"
    const trendCoefficients = calculateAnchoredTrendCoefficients(
      filteredData,
      baseYear,
    );
    if (!trendCoefficients) {
      return null;
    }

    const futureYears = generateYearRange(currentYear + 1, endYear);

    if (futureYears.length === 0) {
      return null;
    }

    // Get starting value - either from actual data or approximated historical
    let startingValue: number;
    const lastDataPoint = data.find((d) => d.year === lastYearWithData);

    if (currentYear > lastYearWithData && lastDataPoint?.total) {
      // Use approximated historical value if available
      const approximatedHistorical = calculateApproximatedHistorical(
        data,
        lastYearWithData,
        currentYear,
        baseYear,
      );
      startingValue =
        approximatedHistorical?.approximatedData[currentYear] ||
        lastDataPoint.total;
    } else {
      startingValue = lastDataPoint?.total || 0;
    }

    const trendData: Record<number, number> = {
      [currentYear]: startingValue,
    };

    // Project future values using trend coefficients
    const minYear = getMinYear(filteredData, baseYear);
    for (const year of futureYears) {
      const trendValue = Math.max(
        0,
        trendCoefficients.slope * (year - minYear) +
          trendCoefficients.intercept,
      );
      trendData[year] = trendValue;
    }

    // Calculate cumulative emissions using trapezoidal integration
    const cumulativeEmissions = calculateTrapezoidalIntegration(trendData);

    return {
      trendData,
      cumulativeEmissions,
      trendCoefficients,
    };
  }, "calculateFutureTrend");
};

// ============================================================================
// EXPONENTIAL CALCULATIONS
// ============================================================================
// These functions handle exponential regression and data point creation for
// exponential trend analysis.

// Helper function to calculate exponential scale factor
/**
 * Calculates the scale factor for exponential regression.
 * This is used to align the exponential fit to the last actual data point.
 * @throws {Error} When exponential fit parameters are invalid or last year with data is invalid
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

// Helper function to create exponential data point
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

// ============================================================================
// MAIN GENERATOR FUNCTIONS
// ============================================================================
// These are the primary exported functions that generate comprehensive data sets
// combining historical data, approximations, and future projections.

// Helper functions for generateSophisticatedApproximatedData
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
      baseYear,
    );

    // Calculate future trend projection
    const futureTrend = calculateFutureTrend(
      data,
      lastYearWithData,
      currentYear,
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

// ============================================================================
// SIMPLE APPROXIMATION FUNCTIONS
// ============================================================================
// These functions provide simplified approximation logic for basic use cases.
// They are less sophisticated than the main generator functions but are faster
// and easier to understand.

// Helper functions for generateApproximatedData
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

// Helper function to calculate regression parameters
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

// Helper function to create approximated data point
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

// Simple calculation with base year support
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
