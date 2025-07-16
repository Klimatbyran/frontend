/**
 * Trend Analysis Functions
 * 
 * TODO: MIGRATION STATUS
 * 
 * ✅ COMPLETED:
 * - Consolidated all mathematical functions (regression, statistics, R²) here
 * - Standardized data format to DataPoint[] ({ year, value })
 * - Removed duplicate functions across files
 * - Updated components to use canonical functions
 * 
 * 🔄 IN PROGRESS:
 * - Regression format compatibility layer
 * 
 * 📋 FUTURE MIGRATION TASKS:
 * 1. Migrate all legacy functions in companyEmissionsCalculations.ts to use new regression format directly
 * 2. Remove intercept conversion logic (intercept = regression.intercept - slope * minYear)
 * 3. Update formulas from slope * year + intercept to slope * (year - minYear) + intercept
 * 4. Functions to migrate: calculateApproximatedHistorical, calculateFutureTrend, generateSophisticatedApproximatedData
 * 
 * Current state: New canonical functions with backward compatibility layer
 */

import { DataPoint } from "./types";

/**
 * Weighted linear regression that gives more weight to recent data points
 */
export const calculateWeightedLinearRegression = (data: DataPoint[]) => {
  const n = data.length;
  if (n < 4) {
    // If less than 4 points, fall back to calculateTrendSlope
    if (n < 2) return null;
    const slope = calculateTrendSlope(data);
    // For intercept, use last point
    const lastPoint = data[data.length - 1];
    const intercept = lastPoint.value - slope * lastPoint.year;
    return { slope, intercept };
  }

  // Sort data by year to ensure proper ordering
  const sortedData = [...data].sort((a, b) => a.year - b.year);

  // Exponential decay weights: most recent gets 1, next gets decay, then decay^2, ...
  const decay = 0.7;
  const weights = sortedData.map((_, index) => Math.pow(decay, n - 1 - index));

  let sumW = 0;
  let sumWX = 0;
  let sumWY = 0;
  let sumWXY = 0;
  let sumWXX = 0;

  for (let i = 0; i < n; i++) {
    const point = sortedData[i];
    const weight = weights[i];

    sumW += weight;
    sumWX += weight * point.year;
    sumWY += weight * point.value;
    sumWXY += weight * point.year * point.value;
    sumWXX += weight * point.year * point.year;
  }

  const slope =
    (sumW * sumWXY - sumWX * sumWY) / (sumW * sumWXX - sumWX * sumWX);
  const lastPoint = sortedData[sortedData.length - 1];
  const intercept = lastPoint.value - slope * lastPoint.year;

  return { slope, intercept };
};

/**
 * Base year-aware exponential regression
 */
export function fitExponentialRegression(data: DataPoint[]) {
  const filtered = data.filter((d) => d.value > 0);
  if (filtered.length < 2) return null;
  const n = filtered.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;
  for (const { year, value } of filtered) {
    const ly = Math.log(value);
    sumX += year;
    sumY += ly;
    sumXY += year * ly;
    sumXX += year * year;
  }
  const b = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const a = Math.exp((sumY - b * sumX) / n);
  return { a, b };
}

/**
 * Weighted exponential regression: fit y = a * exp(bx) with exponential decay weights
 */
export function calculateWeightedExponentialRegression(
  data: DataPoint[],
  decay: number = 0.7,
) {
  // Only use points with value > 0
  const filtered = data.filter((d) => d.value > 0);
  const n = filtered.length;
  if (n < 2) return null;
  // Most recent gets weight 1, next gets decay, then decay^2, ...
  const weights = filtered.map((_, i) => Math.pow(decay, n - 1 - i));
  let sumW = 0,
    sumWX = 0,
    sumWY = 0,
    sumWXY = 0,
    sumWXX = 0;
  for (let i = 0; i < n; i++) {
    const x = filtered[i].year;
    const ly = Math.log(filtered[i].value);
    const w = weights[i];
    sumW += w;
    sumWX += w * x;
    sumWY += ly;
    sumWXY += w * x * ly;
    sumWXX += w * x * x;
  }
  const b = (sumW * sumWXY - sumWX * sumWY) / (sumW * sumWXX - sumWX * sumWX);
  const a = Math.exp((sumWY - b * sumWX) / sumW);
  return { a, b };
}

/**
 * Recent exponential regression: fit y = a * exp(bx) to last N years (unweighted)
 */
export function calculateRecentExponentialRegression(
  data: DataPoint[],
  recentN: number = 4,
) {
  const recent = data.slice(-recentN);
  return fitExponentialRegression(recent);
}

/**
 * Calculate recent stability based on the last N years of data
 * Returns the coefficient of variation (std dev / mean) for recent data
 */
export function calculateRecentStability(
  data: DataPoint[],
  recentYears: number = 4,
): number {
  if (!data?.length || data.length < recentYears) {
    return 0;
  }

  const recentPoints = data.slice(-recentYears);
  const recentValues = recentPoints.map((p) => p.value);
  const recentMean =
    recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
  const recentVariance =
    recentValues.reduce((a, b) => a + Math.pow(b - recentMean, 2), 0) /
    recentValues.length;
  const recentStdDev = Math.sqrt(recentVariance);

  return recentStdDev / (recentMean || 1);
}

/**
 * Detect unusual data points in emissions time series
 * For emissions data, we look for significant year-over-year changes
 * that are unusual compared to the typical variation in the dataset
 */
export function detectUnusualEmissionsPoints(
  data: DataPoint[],
  multiplier: number = 4,
): {
  hasUnusualPoints: boolean;
  details?: {
    year: number;
    fromYear: number;
    toYear: number;
    fromValue: number;
    toValue: number;
    change: number;
    threshold: number;
    direction: string;
    reason: string;
  }[];
} {
  if (!data?.length || data.length < 4) {
    return { hasUnusualPoints: false };
  }

  // Sort by year to ensure chronological order
  const sortedData = [...data].sort((a, b) => a.year - b.year);
  const values = sortedData.map((p) => p.value);
  const years = sortedData.map((p) => p.year);

  // Calculate year-over-year percentage changes
  const yearOverYearChanges: number[] = [];
  for (let i = 1; i < values.length; i++) {
    const currentValue = values[i];
    const previousValue = values[i - 1];
    if (previousValue !== 0) {
      const change = Math.abs((currentValue - previousValue) / previousValue);
      yearOverYearChanges.push(change);
    }
  }

  if (yearOverYearChanges.length === 0) {
    return { hasUnusualPoints: false };
  }

  // Calculate median year-over-year change
  const sortedChanges = [...yearOverYearChanges].sort((a, b) => a - b);
  const medianChange = sortedChanges[Math.floor(sortedChanges.length / 2)];

  // A year is unusual if its year-over-year change is more than multiplier x the median change
  // This identifies years with unusually large changes compared to typical variation
  const threshold = multiplier * medianChange;
  const unusualChanges = yearOverYearChanges.filter(
    (change) => change > threshold,
  );
  const hasUnusualPoints = unusualChanges.length > 0;

  // Create detailed information about unusual points
  const details = unusualChanges.map((change, index) => {
    // Find the corresponding year by finding the index in yearOverYearChanges
    const changeIndex = yearOverYearChanges.findIndex((c) => c === change);
    const fromYear = years[changeIndex]; // The year before the change
    const toYear = years[changeIndex + 1]; // The year with the unusual change
    const fromValue = values[changeIndex];
    const toValue = values[changeIndex + 1];

    // Determine if it's an increase or decrease
    const direction = toValue > fromValue ? "increase" : "decrease";

    return {
      year: toYear,
      fromYear,
      toYear,
      fromValue,
      toValue,
      change: change * 100, // Convert to percentage
      threshold: threshold * 100, // Convert to percentage
      direction,
      reason: `${fromYear}→${toYear}: ${(change * 100).toFixed(1)}% ${direction} (${fromValue.toLocaleString()} → ${toValue.toLocaleString()}) exceeds ${(threshold * 100).toFixed(1)}% threshold`,
    };
  });

  return {
    hasUnusualPoints,
    details: hasUnusualPoints ? details : undefined,
  };
}

/**
 * Calculate R² for linear regression
 */
export function calculateR2Linear(data: DataPoint[]): number {
  if (!data?.length || data.length < 2) {
    return 0;
  }

  const n = data.length;
  const sumX = data.reduce((a, p) => a + p.year, 0);
  const sumY = data.reduce((a, p) => a + p.value, 0);
  const sumXY = data.reduce((a, p) => a + p.year * p.value, 0);
  const sumX2 = data.reduce((a, p) => a + p.year * p.year, 0);
  const sumY2 = data.reduce((a, p) => a + p.value * p.value, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const ssTot = data.reduce((a, p) => a + Math.pow(p.value - sumY / n, 2), 0);
  const ssRes = data.reduce(
    (a, p) => a + Math.pow(p.value - (slope * p.year + intercept), 2),
    0,
  );

  return ssTot === 0 ? 1 : 1 - ssRes / ssTot;
}

/**
 * Calculate R² for exponential regression
 */
export function calculateR2Exponential(data: DataPoint[]): number {
  if (!data?.length || data.length < 2) {
    return 0;
  }

  // Fit y = a * exp(bx) via log transform
  const logPoints = data
    .filter((p) => p.value > 0)
    .map((p) => ({ year: p.year, value: Math.log(p.value) }));

  if (logPoints.length < 2) {
    return 0;
  }

  const n = logPoints.length;
  const sumX = logPoints.reduce((a, p) => a + p.year, 0);
  const sumY = logPoints.reduce((a, p) => a + p.value, 0);
  const sumXY = logPoints.reduce((a, p) => a + p.year * p.value, 0);
  const sumX2 = logPoints.reduce((a, p) => a + p.year * p.year, 0);
  const meanY = sumY / n;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const ssTot = logPoints.reduce((a, p) => a + Math.pow(p.value - meanY, 2), 0);
  const ssRes = logPoints.reduce(
    (a, p) => a + Math.pow(p.value - (slope * p.year + intercept), 2),
    0,
  );

  return ssTot === 0 ? 1 : 1 - ssRes / ssTot;
}

/**
 * Calculate trend slope using linear regression
 */
export function calculateTrendSlope(data: DataPoint[]): number {
  if (!data?.length || data.length < 2) {
    return 0;
  }

  const n = data.length;
  const sumX = data.reduce((a, p) => a + p.year, 0);
  const sumY = data.reduce((a, p) => a + p.value, 0);
  const sumXY = data.reduce((a, p) => a + p.year * p.value, 0);
  const sumX2 = data.reduce((a, p) => a + p.year * p.year, 0);

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) {
    return 0;
  }

  return (n * sumXY - sumX * sumY) / denominator;
}

/**
 * Determine trend direction based on slope and data characteristics
 */
export function calculateTrendDirection(
  data: DataPoint[],
  stabilityThreshold: number = 0.01,
  minDataPoints: number = 2,
): "increasing" | "decreasing" | "stable" {
  if (!data?.length || data.length < minDataPoints) {
    return "stable";
  }

  const values = data.map((p) => p.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const trendSlope = calculateTrendSlope(data);

  if (Math.abs(trendSlope) < stabilityThreshold * mean) {
    return "stable";
  } else {
    return trendSlope > 0 ? "increasing" : "decreasing";
  }
}

/**
 * Calculate standard deviation for an array of numbers
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map((value) => Math.pow(value - mean, 2));
  const avgSquareDiff =
    squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
}

/**
 * Calculate basic statistics for a dataset
 */
export function calculateBasicStatistics(data: DataPoint[]): {
  mean: number;
  variance: number;
  stdDev: number;
  min: number;
  max: number;
  span: number;
} {
  if (!data?.length) {
    return {
      mean: 0,
      variance: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      span: 0,
    };
  }

  const values = data.map((p) => p.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;

  return {
    mean,
    variance,
    stdDev,
    min,
    max,
    span,
  };
}

/**
 * Comprehensive trend analysis that combines all the above calculations
 */
export function analyzeTrendCharacteristics(
  data: DataPoint[],
  baseYear?: number,
): {
  recentStability: number;
  hasOutliers: boolean;
  r2Linear: number;
  r2Exponential: number;
  trendDirection: "increasing" | "decreasing" | "stable";
  trendSlope: number;
  statistics: {
    mean: number;
    variance: number;
    stdDev: number;
    min: number;
    max: number;
    span: number;
  };
} {
  // Filter data to base year if provided, or use all data if no base year
  const filteredData = baseYear ? data.filter((d) => d.year >= baseYear) : data;

  if (!filteredData?.length || filteredData.length < 2) {
    return {
      recentStability: 0,
      hasOutliers: false,
      r2Linear: 0,
      r2Exponential: 0,
      trendDirection: "stable",
      trendSlope: 0,
      statistics: {
        mean: 0,
        variance: 0,
        stdDev: 0,
        min: 0,
        max: 0,
        span: 0,
      },
    };
  }

  const unusualPointsResult = detectUnusualEmissionsPoints(filteredData);
  return {
    recentStability: calculateRecentStability(filteredData),
    hasOutliers: unusualPointsResult.hasUnusualPoints,
    r2Linear: calculateR2Linear(filteredData),
    r2Exponential: calculateR2Exponential(filteredData),
    trendDirection: calculateTrendDirection(filteredData),
    trendSlope: calculateTrendSlope(filteredData),
    statistics: calculateBasicStatistics(filteredData),
  };
}

export interface TrendAnalysis {
  companyId: string;
  companyName: string;
  method: string;
  explanation: string;
  baseYear?: number;
  dataPoints: number;
  mean: number;
  stdDev: number;
  variance: number;
  missingYears: number;
  hasUnusualPoints: boolean;
  unusualPointsDetails?: {
    year: number;
    fromYear: number;
    toYear: number;
    fromValue: number;
    toValue: number;
    change: number;
    threshold: number;
    direction: string;
    reason: string;
  }[];
  recentStability: number;
  r2Linear: number;
  r2Exponential: number;
  trendDirection: "increasing" | "decreasing" | "stable" | "insufficient_data";
  trendSlope: number;
  yearlyPercentageChange: number;
  dataRange: { min: number; max: number; span: number };
}

export const createInsufficientDataAnalysis = (
  company: any,
  effectiveDataPoints: number,
  checkBaseYear?: number,
): TrendAnalysis => ({
  companyId: company.wikidataId,
  companyName: company.name,
  method: "simple",
  explanation: checkBaseYear
    ? `Simple average slope is used because there are only ${effectiveDataPoints} data points since base year ${checkBaseYear}. More complex methods are unreliable with so little data.`
    : `Simple average slope is used because there are only ${effectiveDataPoints} data points. More complex methods are unreliable with so little data.`,
  baseYear: company.baseYear?.year,
  dataPoints: effectiveDataPoints,
  mean: 0,
  stdDev: 0,
  variance: 0,
  missingYears: 0,
  hasUnusualPoints: false,
  unusualPointsDetails: undefined,
  recentStability: 0,
  r2Linear: 0,
  r2Exponential: 0,
  trendDirection: "insufficient_data" as const,
  trendSlope: 0,
  yearlyPercentageChange: 0,
  dataRange: { min: 0, max: 0, span: 0 },
});

export const processCompanyData = (company: any): TrendAnalysis => {
  const data = company.reportingPeriods
    .filter(
      (period: any) =>
        period.emissions &&
        period.emissions.calculatedTotalEmissions !== null &&
        period.emissions.calculatedTotalEmissions !== undefined,
    )
    .map((period: any) => ({
      year: new Date(period.endDate).getFullYear(),
      total: period.emissions!.calculatedTotalEmissions!,
    }))
    .sort((a: any, b: any) => a.year - b.year);

  const checkBaseYear = company.baseYear?.year;
  const checkDataSinceBaseYear = checkBaseYear
    ? data.filter((d: any) => d.year >= checkBaseYear)
    : data;
  const effectiveDataPoints = checkDataSinceBaseYear.length;

  if (effectiveDataPoints < 2) {
    return createInsufficientDataAnalysis(
      company,
      effectiveDataPoints,
      checkBaseYear,
    );
  }

  const baseYear = company.baseYear?.year;
  const dataSinceBaseYear = baseYear
    ? data.filter((d: any) => d.year >= baseYear)
    : data;

  const missingYears = calculateMissingYears(dataSinceBaseYear, baseYear);
  const dataPoints = dataSinceBaseYear.map((d: any) => ({
    year: d.year,
    value: d.total,
  }));

  const analysis = analyzeTrendCharacteristics(dataPoints);
  const unusualPointsResult = detectUnusualEmissionsPoints(dataPoints);
  const { method, explanation } = selectBestTrendLineMethod(
    data,
    company.baseYear?.year,
  );

  const yearlyPercentageChange =
    analysis.statistics.mean > 0
      ? (analysis.trendSlope / analysis.statistics.mean) * 100
      : 0;

  return {
    companyId: company.wikidataId,
    companyName: company.name,
    method,
    explanation,
    baseYear: company.baseYear?.year,
    dataPoints: effectiveDataPoints,
    mean: analysis.statistics.mean,
    stdDev: analysis.statistics.stdDev,
    variance: analysis.statistics.variance,
    missingYears,
    hasUnusualPoints: unusualPointsResult.hasUnusualPoints,
    unusualPointsDetails: unusualPointsResult.details,
    recentStability: analysis.recentStability,
    r2Linear: analysis.r2Linear,
    r2Exponential: analysis.r2Exponential,
    trendDirection: analysis.trendDirection,
    trendSlope: analysis.trendSlope,
    yearlyPercentageChange,
    dataRange: {
      min: analysis.statistics.min,
      max: analysis.statistics.max,
      span: analysis.statistics.span,
    },
  };
};

export const calculateSummaryStats = (companies: TrendAnalysis[]) => {
  const methodCounts = companies.reduce(
    (acc, company) => {
      acc[company.method] = (acc[company.method] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const avgDataPoints =
    companies.length > 0
      ? companies.reduce((sum, company) => sum + company.dataPoints, 0) /
        companies.length
      : 0;

  const avgMissingYears =
    companies.length > 0
      ? companies.reduce((sum, company) => sum + company.missingYears, 0) /
        companies.length
      : 0;

  const outlierPercentage =
    companies.length > 0
      ? (companies.filter((c) => c.hasUnusualPoints).length /
          companies.length) *
        100
      : 0;

  return { methodCounts, avgDataPoints, avgMissingYears, outlierPercentage };
};

/**
 * Calculates missing years in emissions data (base year aware and counts zero emissions as missing)
 * @param data Array of emissions data points
 * @param baseYear Optional base year to filter data from
 * @returns Number of missing years
 */
export function calculateMissingYears(
  data: { year: number; total: number | null | undefined }[],
  baseYear?: number,
): number {
  // Filter to valid data points since base year
  const validData = data.filter(
    (d) =>
      d.total !== undefined &&
      d.total !== null &&
      (baseYear === undefined || d.year >= baseYear),
  );

  if (validData.length < 2) return 0;

  const years = validData.map((d) => d.year);
  const startYear = baseYear || years[0];
  const endYear = years[years.length - 1];
  const expectedYears = endYear - startYear + 1;

  // Count years with zero emissions as missing
  const zeroEmissionsYears = validData.filter((d) => d.total === 0).length;

  return expectedYears - validData.length + zeroEmissionsYears;
}

/**
 * Selects the best trend line method for a company based on its emissions data.
 * Returns { method, explanation }.
 */
export function selectBestTrendLineMethod(
  data: { year: number; total: number | null | undefined }[],
  baseYear?: number,
): { method: string; explanation: string } {
  // Filter to points since base year
  const points = data
    .filter(
      (d) =>
        d.total !== undefined &&
        d.total !== null &&
        (baseYear === undefined || d.year >= baseYear),
    )
    .map((d) => ({ year: d.year, value: d.total as number }));
  const numPoints = points.length;
  if (numPoints < 3) {
    return {
      method: "simple",
      explanation: `Simple average slope is used because there are only ${numPoints} data points since the base year. More complex methods are unreliable with so little data.`,
    };
  }
  // Check for missing years using the utility function
  const missingYears = calculateMissingYears(data, baseYear);

  // Convert points to DataPoint format for utility functions
  const dataPoints = points.map((p) => ({ year: p.year, value: p.value }));

  // Use utility functions for calculations
  const unusualPointsResult = detectUnusualEmissionsPoints(dataPoints);
  const hasUnusualPoints = unusualPointsResult.hasUnusualPoints;
  const recentStability = calculateRecentStability(dataPoints);
  const r2Lin = calculateR2Linear(dataPoints);
  const r2Exp = calculateR2Exponential(dataPoints);
  const statistics = calculateBasicStatistics(dataPoints);

  // Heuristic selection
  if (missingYears > 2) {
    return {
      method: "linear",
      explanation: `Linear regression is used because there are ${missingYears} missing years in the data, and linear regression is robust to missing data.`,
    };
  }
  if (recentStability < 0.1 && dataPoints.length >= 4) {
    return {
      method: "weightedLinear",
      explanation: `Weighted linear regression is used because the last 4 years are very stable (std dev < 10% of mean). This method gives more weight to recent stable data and reduces the impact of older data or unusual points.`,
    };
  }
  if (hasUnusualPoints) {
    return {
      method: "weightedLinear",
      explanation: `Weighted linear regression is used because unusual year-over-year changes were detected (exceeding 4x the median change). This method downweights unusual points for a more robust trend.`,
    };
  }
  if (r2Exp - r2Lin > 0.05) {
    if (
      hasUnusualPoints ||
      statistics.variance > 0.15 * (statistics.mean || 1)
    ) {
      return {
        method: "weightedExponential",
        explanation: `Weighted exponential regression is used because the exponential fit (R²=${r2Exp.toFixed(2)}) is significantly better than linear (R²=${r2Lin.toFixed(2)}), and the data has unusual points or high variance. This method downweights unusual points while fitting an exponential trend.`,
      };
    }
    return {
      method: "exponential",
      explanation: `Exponential regression is used because the exponential fit (R²=${r2Exp.toFixed(2)}) is significantly better than linear (R²=${r2Lin.toFixed(2)}). This suggests a non-linear trend.`,
    };
  }
  if (statistics.variance > 0.2 * (statistics.mean || 1)) {
    return {
      method: "weightedLinear",
      explanation: `Weighted linear regression is used because the data has high variance (std dev > 20% of mean), making it more robust to fluctuations.`,
    };
  }
  if (dataPoints.length >= 4) {
    const recentData = dataPoints.slice(-4);
    const recentR2Exp = calculateR2Exponential(recentData);
    const recentR2Lin = calculateR2Linear(recentData);
    if (recentR2Exp > 0.8 && recentR2Exp - recentR2Lin > 0.1) {
      return {
        method: "recentExponential",
        explanation: `Recent exponential regression is used because the last 4 years show a strong exponential pattern (R²=${recentR2Exp.toFixed(2)}) that is significantly better than linear (R²=${recentR2Lin.toFixed(2)}). This focuses on the recent exponential trend.`,
      };
    }
  }
  return {
    method: "linear",
    explanation: `Linear regression is used as the default because the data is sufficiently complete and does not show strong non-linear or outlier behavior.`,
  };
}

/**
 * Simple linear regression for backward compatibility
 * Returns slope and intercept for y = mx + b
 *
 * TODO: MIGRATION - This function uses year - minYear for x-values, so intercept is at the first year
 * Legacy functions expect intercept at year 0, so they convert: intercept = regression.intercept - slope * minYear
 * Future: Migrate all legacy functions to use this format directly
 */
export function calculateLinearRegression(
  data: DataPoint[],
): { slope: number; intercept: number } | null {
  if (data.length < 2) return null;

  const minYear = Math.min(...data.map((d) => d.year));
  const points = data.map((d) => ({ x: d.year - minYear, y: d.value }));

  const n = points.length;
  const sumX = points.reduce((a, p) => a + p.x, 0);
  const sumY = points.reduce((a, p) => a + p.y, 0);
  const sumXY = points.reduce((a, p) => a + p.x * p.y, 0);
  const sumX2 = points.reduce((a, p) => a + p.x * p.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}
