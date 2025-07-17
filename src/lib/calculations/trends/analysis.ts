/**
 * Trend Analysis Functions
 */

import { DataPoint, TrendAnalysis } from "./types";
import { calculateTrendSlope } from "./regression";
import {
  calculateR2Linear,
  calculateR2Exponential,
  calculateBasicStatistics,
} from "./statistics";
import { detectUnusualEmissionsPoints } from "./detection";

/**
 * Filter data to only include points with valid total values since base year
 */
function getValidDataSinceBaseYear(
  data: { year: number; total: number | null | undefined }[],
  baseYear?: number,
): { year: number; total: number }[] {
  return data.filter(
    (d): d is { year: number; total: number } =>
      d.total !== undefined &&
      d.total !== null &&
      (baseYear === undefined || d.year >= baseYear),
  );
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

export const createInsufficientDataAnalysis = (
  company: any,
  effectiveDataPoints: number,
  checkBaseYear?: number,
): TrendAnalysis => ({
  companyId: company.wikidataId,
  companyName: company.name,
  method: "simple",
  explanation: checkBaseYear
    ? "trendAnalysis.insufficientDataWithBaseYear"
    : "trendAnalysis.insufficientData",
  explanationParams: checkBaseYear
    ? { dataPoints: effectiveDataPoints, baseYear: checkBaseYear }
    : { dataPoints: effectiveDataPoints },
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
  const { method, explanation, explanationParams } = selectBestTrendLineMethod(
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
    explanationParams,
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
  const validData = getValidDataSinceBaseYear(data, baseYear);

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
 * Returns { method, explanation, explanationParams }.
 */
export function selectBestTrendLineMethod(
  data: { year: number; total: number | null | undefined }[],
  baseYear?: number,
): {
  method: string;
  explanation: string;
  explanationParams?: Record<string, string | number>;
} {
  // Filter to points since base year
  const points = getValidDataSinceBaseYear(data, baseYear).map((d) => ({
    year: d.year,
    value: d.total,
  }));
  const numPoints = points.length;
  if (numPoints < 3) {
    return {
      method: "simple",
      explanation: "trendAnalysis.simpleMethodInsufficientData",
      explanationParams: { dataPoints: numPoints },
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
      method: "anchored",
      explanation: "trendAnalysis.anchoredMethodMissingYears",
      explanationParams: { missingYears },
    };
  }
  if (recentStability < 0.1 && dataPoints.length >= 4) {
    return {
      method: "weightedLinear",
      explanation: "trendAnalysis.weightedLinearMethodStable",
    };
  }
  if (hasUnusualPoints) {
    return {
      method: "weightedLinear",
      explanation: "trendAnalysis.weightedLinearMethodUnusualPoints",
    };
  }
  if (r2Exp - r2Lin > 0.05) {
    if (
      hasUnusualPoints ||
      statistics.variance > 0.15 * (statistics.mean || 1)
    ) {
      return {
        method: "weightedExponential",
        explanation: "trendAnalysis.weightedExponentialMethodHighVariance",
        explanationParams: { r2Exp: r2Exp.toFixed(2), r2Lin: r2Lin.toFixed(2) },
      };
    }
    return {
      method: "exponential",
      explanation: "trendAnalysis.exponentialMethodBetterFit",
      explanationParams: { r2Exp: r2Exp.toFixed(2), r2Lin: r2Lin.toFixed(2) },
    };
  }
  if (statistics.variance > 0.2 * (statistics.mean || 1)) {
    return {
      method: "weightedLinear",
      explanation: "trendAnalysis.weightedLinearMethodHighVariance",
    };
  }
  if (dataPoints.length >= 4) {
    const recentData = dataPoints.slice(-4);
    const recentR2Exp = calculateR2Exponential(recentData);
    const recentR2Lin = calculateR2Linear(recentData);
    if (recentR2Exp > 0.8 && recentR2Exp - recentR2Lin > 0.1) {
      return {
        method: "recentExponential",
        explanation: "trendAnalysis.recentExponentialMethodStrongPattern",
        explanationParams: {
          r2Exp: recentR2Exp.toFixed(2),
          r2Lin: recentR2Lin.toFixed(2),
        },
      };
    }
  }
  return {
    method: "linear",
    explanation: "trendAnalysis.linearMethodDefault",
  };
}
