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
