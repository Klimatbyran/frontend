/**
 * Utility Functions for Trend Analysis
 *
 * Helper functions for creating standardized objects and calculating summary statistics
 */

import { TrendAnalysis } from "./types";

/**
 * Creates a standardized insufficient data analysis object
 * Used when there's not enough data to perform meaningful trend analysis
 */
export const createInsufficientDataAnalysis = (
  company: any,
  effectiveDataPoints: number,
  checkBaseYear?: number,
): TrendAnalysis => ({
  companyId: company.wikidataId,
  companyName: company.name,
  method: "none",
  explanation: checkBaseYear
    ? "trendAnalysis.insufficientDataSinceBaseYear"
    : "trendAnalysis.insufficientData",
  explanationParams: checkBaseYear
    ? { dataPoints: effectiveDataPoints, baseYear: checkBaseYear }
    : { dataPoints: effectiveDataPoints },
  baseYear: company.baseYear?.year,
  // New data metrics
  originalDataPoints: effectiveDataPoints,
  cleanDataPoints: effectiveDataPoints,
  missingYearsCount: 0,
  outliersCount: 0,
  unusualPointsCount: 0,
  excludedData: {
    missingYears: [],
    outliers: [],
    unusualPoints: [],
  },
  issues: ["insufficientData"],
  issueCount: 1,
  dataPoints: effectiveDataPoints,
  missingYears: 0,
  hasUnusualPoints: false,
  trendDirection: "stable" as const,
  yearlyPercentageChange: 0,
});

/**
 * Calculates summary statistics for dashboard display
 * Aggregates data across multiple companies for overview metrics
 */
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
      ? companies.reduce(
          (sum, company) => sum + company.originalDataPoints,
          0,
        ) / companies.length
      : 0;

  const avgCleanDataPoints =
    companies.length > 0
      ? companies.reduce((sum, company) => sum + company.cleanDataPoints, 0) /
        companies.length
      : 0;

  const avgMissingYears =
    companies.length > 0
      ? companies.reduce((sum, company) => sum + company.missingYearsCount, 0) /
        companies.length
      : 0;

  const outlierPercentage =
    companies.length > 0
      ? (companies.filter((c) => c.unusualPointsCount > 0).length /
          companies.length) *
        100
      : 0;

  return {
    methodCounts,
    avgDataPoints,
    avgCleanDataPoints,
    avgMissingYears,
    outlierPercentage,
  };
};
