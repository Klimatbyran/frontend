/**
 * Trend Analysis Functions
 */

import { DataPoint, TrendAnalysis } from "./types";
import {
  calculateR2Linear,
  calculateR2Exponential,
  calculateBasicStatistics,
} from "./statistics";
import {
  calculateLinearRegression,
  calculateWeightedLinearRegression,
  calculateWeightedExponentialRegression,
  fitExponentialRegression,
  calculateTrendSlope,
} from "./regression";

/**
 * Get list of missing years between base year and latest data year
 */
function getMissingYearsList(
  data: { year: number; total: number | null | undefined }[],
  baseYear?: number,
): number[] {
  const validData = data.filter(
    (d) => d.total !== undefined && d.total !== null,
  );
  if (validData.length === 0) return [];

  const years = validData.map((d) => d.year).sort((a, b) => a - b);
  const startYear = baseYear || years[0];
  const endYear = years[years.length - 1];

  const missingYears: number[] = [];
  for (let year = startYear; year <= endYear; year++) {
    if (!years.includes(year)) {
      missingYears.push(year);
    }
  }

  return missingYears;
}

/**
 * Validate unusual points by checking if Scope 3 categories were added
 * Only checks Scope 3 if unusual point value > previous year value
 */
function validateOutliersWithScope3(
  dataPoints: DataPoint[],
  unusualPoints: Array<{
    year: number;
    value: number;
    details: string;
  }>,
  originalData?: { year: number; total: number | null | undefined }[],
): Array<{
  year: number;
  value: number;
  reason: "unusual_change" | "no_scope3_improvement";
}> {
  const validatedOutliers: Array<{
    year: number;
    value: number;
    reason: "unusual_change" | "no_scope3_improvement";
  }> = [];

  // Find the most recent year to avoid excluding it
  const mostRecentYear = Math.max(...dataPoints.map((p) => p.year));

  for (const point of unusualPoints) {
    // Don't exclude the most recent data point - it's needed for the trendline
    if (point.year === mostRecentYear) {
      continue;
    }

    // Find the previous year's data point
    const previousPoint = dataPoints.find((p) => p.year === point.year - 1);

    if (previousPoint) {
      // Check if this is a near-zero emissions point (likely an outlier)
      const isNearZero = point.value < 100; // Less than 100 tons CO2e
      const isSignificantDrop =
        previousPoint.value > 1000 && point.value < previousPoint.value * 0.1; // Drop to less than 10% of previous

      if (isNearZero || isSignificantDrop) {
        // Near-zero emissions or significant drop - mark as outlier
        validatedOutliers.push({
          year: point.year,
          value: point.value,
          reason: "unusual_change",
        });
      } else if (point.value > previousPoint.value) {
        // Increase in emissions - check if it's justified by Scope 3 improvements
        const isScope3Justified = checkIfScope3Justified(
          point.year,
          previousPoint.year,
          originalData,
        );

        if (isScope3Justified) {
          // Increase is justified by new Scope 3 categories - don't mark as outlier
        } else {
          // Increase is not justified - mark as outlier (but not the most recent)
          if (point.year !== mostRecentYear) {
            validatedOutliers.push({
              year: point.year,
              value: point.value,
              reason: "no_scope3_improvement",
            });
          }
        }
      }
      // If point.value <= previousPoint.value and not near-zero, don't mark as outlier
    } else {
      // If no previous year data, check if it's near-zero
      if (point.value < 100) {
        validatedOutliers.push({
          year: point.year,
          value: point.value,
          reason: "unusual_change",
        });
      }
    }
  }

  return validatedOutliers;
}

/**
 * Check if an emission increase is justified by new Scope 3 categories
 * Compares Scope 3 categories between two years to see if new categories were added
 */
function checkIfScope3Justified(
  currentYear: number,
  previousYear: number,
  originalData?: { year: number; total: number | null | undefined }[],
): boolean {
  if (!originalData) {
    // If we don't have access to the original data, assume it's justified (conservative)
    return true;
  }

  // Find the data for both years
  const currentYearData = originalData.find((d) => d.year === currentYear);
  const previousYearData = originalData.find((d) => d.year === previousYear);

  if (!currentYearData || !previousYearData) {
    // If we can't find data for either year, assume it's justified
    return true;
  }

  // Check if we have Scope 3 category data
  // Note: This assumes the original data includes scope3Categories
  // You might need to adjust this based on your actual data structure
  const currentScope3Categories =
    (currentYearData as any)?.scope3Categories || [];
  const previousScope3Categories =
    (previousYearData as any)?.scope3Categories || [];

  // If we don't have Scope 3 category data, assume it's justified
  if (
    currentScope3Categories.length === 0 &&
    previousScope3Categories.length === 0
  ) {
    return true;
  }

  // Check if new categories were added
  const currentCategoryIds = currentScope3Categories.map(
    (cat: any) => cat.category,
  );
  const previousCategoryIds = previousScope3Categories.map(
    (cat: any) => cat.category,
  );

  const newCategories = currentCategoryIds.filter(
    (id: number) => !previousCategoryIds.includes(id),
  );

  // If new categories were added, the increase is justified
  return newCategories.length > 0;
}

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

  const unusualPointsResult =
    detectUnusualEmissionsPointsEnhanced(filteredData);
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

  const dataPoints = dataSinceBaseYear.map((d: any) => ({
    year: d.year,
    value: d.total,
  }));

  const analysis = analyzeTrendCharacteristics(dataPoints);
  const unusualPointsResult = detectUnusualEmissionsPointsEnhanced(dataPoints);

  // Map the enhanced unusual points to legacy format for backward compatibility
  const legacyUnusualPointsDetails = unusualPointsResult.details?.map(
    (point) => ({
      year: point.toYear,
      fromYear: point.fromYear,
      toYear: point.toYear,
      fromValue: point.fromValue,
      toValue: point.toValue,
      change: point.relativeChange,
      threshold: point.threshold,
      direction: point.direction,
      reason: point.reason,
    }),
  );

  // Use the new selectBestTrendLineMethod
  const trendResult = selectBestTrendLineMethod(data, company.baseYear?.year);

  // Calculate yearly percentage change using the trend analysis coefficients
  let yearlyPercentageChange = 0;
  let trendDirection: "increasing" | "decreasing" | "stable" = "stable";

  if (trendResult.coefficients) {
    if (
      "slope" in trendResult.coefficients &&
      "intercept" in trendResult.coefficients
    ) {
      // Linear coefficients
      const slope = trendResult.coefficients.slope;
      yearlyPercentageChange =
        analysis.statistics.mean > 0
          ? (slope / analysis.statistics.mean) * 100
          : 0;
      // Determine trend direction from slope
      if (Math.abs(slope) < 0.01 * analysis.statistics.mean) {
        trendDirection = "stable";
      } else {
        trendDirection = slope > 0 ? "increasing" : "decreasing";
      }
    } else if (
      "a" in trendResult.coefficients &&
      "b" in trendResult.coefficients
    ) {
      // Exponential coefficients
      const b = trendResult.coefficients.b;
      yearlyPercentageChange = (Math.exp(b) - 1) * 100;
      // Determine trend direction from exponential growth rate
      if (Math.abs(b) < 0.01) {
        trendDirection = "stable";
      } else {
        trendDirection = b > 0 ? "increasing" : "decreasing";
      }
    }
  } else {
    // Fallback to legacy calculation for "none" method or when no coefficients
    yearlyPercentageChange =
      analysis.statistics.mean > 0
        ? (analysis.trendSlope / analysis.statistics.mean) * 100
        : 0;
    trendDirection = analysis.trendDirection;
  }

  return {
    companyId: company.wikidataId,
    companyName: company.name,
    method: trendResult.method,
    explanation: trendResult.explanation,
    explanationParams: trendResult.explanationParams,
    coefficients: trendResult.coefficients,
    baseYear: company.baseYear?.year,
    // New data metrics
    originalDataPoints: trendResult.originalDataPoints,
    cleanDataPoints: trendResult.cleanDataPoints,
    missingYearsCount: trendResult.missingYearsCount,
    outliersCount: trendResult.outliersCount,
    unusualPointsCount: trendResult.unusualPointsCount,
    excludedData: {
      missingYears: trendResult.excludedData.missingYears,
      outliers: trendResult.excludedData.outliers,
      unusualPoints: trendResult.excludedData.unusualPoints.map((point) => ({
        year: point.year,
        value: point.value,
        fromYear: point.year - 1, // Default to previous year
        toYear: point.year,
        fromValue: 0, // Default values since we don't have the full context
        toValue: point.value,
        relativeChange: 0,
        absoluteChange: 0,
        direction: "unknown",
        details: point.details,
      })),
    },
    issues: trendResult.issues,
    issueCount: trendResult.issueCount,
    // Legacy fields (keeping only the ones still used)
    dataPoints: trendResult.cleanDataPoints,
    missingYears: trendResult.missingYearsCount,
    hasUnusualPoints: unusualPointsResult.hasUnusualPoints,
    trendDirection: trendDirection,
    yearlyPercentageChange,
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
  const validData = data.filter(
    (d) => d.total !== undefined && d.total !== null,
  );
  if (validData.length === 0) return 0;

  const years = validData.map((d) => d.year).sort((a, b) => a - b);
  const startYear = baseYear || years[0];
  const endYear = years[years.length - 1];

  const expectedYears = endYear - startYear + 1;
  const actualYears = years.length;

  return Math.max(0, expectedYears - actualYears);
}

/**
 * Select the best trendline method based on data quality and characteristics
 * New simplified logic that prioritizes data quality over sophisticated methods
 */
export function selectBestTrendLineMethod(
  data: { year: number; total: number | null | undefined }[],
  baseYear?: number,
): {
  method: string;
  explanation: string;
  explanationParams?: Record<string, string | number>;
  coefficients?:
    | { slope: number; intercept: number }
    | { a: number; b: number };
  cleanData: DataPoint[];
  excludedData: {
    missingYears: number[];
    outliers: Array<{
      year: number;
      value: number;
      reason: "unusual_change" | "no_scope3_improvement";
    }>;
    unusualPoints: Array<{
      year: number;
      value: number;
      details: string;
    }>;
  };
  issues: string[];
  issueCount: number;
  originalDataPoints: number;
  cleanDataPoints: number;
  missingYearsCount: number;
  outliersCount: number;
  unusualPointsCount: number;
} {
  // Step 1: Collect data from base year onwards, excluding missing data
  const originalData = getValidDataSinceBaseYear(data, baseYear);
  const originalDataPoints = originalData.length;

  if (originalDataPoints === 0) {
    return {
      method: "none",
      explanation: "trendAnalysis.insufficientData",
      explanationParams: { dataPoints: 0 },
      coefficients: undefined,
      cleanData: [],
      excludedData: { missingYears: [], outliers: [], unusualPoints: [] },
      issues: ["limitedDataPoints"],
      issueCount: 1,
      originalDataPoints: 0,
      cleanDataPoints: 0,
      missingYearsCount: 0,
      outliersCount: 0,
      unusualPointsCount: 0,
    };
  }

  // Convert to DataPoint format
  const dataPoints: DataPoint[] = originalData.map((d) => ({
    year: d.year,
    value: d.total,
  }));

  // Step 2: Detect missing years
  const missingYearsList = getMissingYearsList(data, baseYear);

  // Step 3: Detect unusual points and outliers
  const unusualPointsResult = detectUnusualEmissionsPointsEnhanced(dataPoints);
  const unusualPoints = (unusualPointsResult.details || []).map((point) => ({
    year: point.toYear,
    value: point.toValue,
    fromYear: point.fromYear,
    toYear: point.toYear,
    fromValue: point.fromValue,
    toValue: point.toValue,
    relativeChange: point.relativeChange,
    absoluteChange: point.absoluteChange,
    direction: point.direction,
    details: point.reason,
  }));

  // Step 4: Validate outliers with Scope 3 check
  const validatedOutliers = validateOutliersWithScope3(
    dataPoints,
    unusualPoints,
    data, // Pass the original data for Scope 3 check
  );

  // Step 5: Create clean dataset (exclude outliers and missing years, but keep unusual points that aren't outliers)
  const cleanData = dataPoints.filter((point) => {
    const isOutlier = validatedOutliers.some(
      (outlier) => outlier.year === point.year,
    );
    const isMissing = missingYearsList.includes(point.year);
    return !isOutlier && !isMissing;
  });

  const cleanDataPoints = cleanData.length;

  // Step 6: Count issues by unique years
  const yearsWithIssues = new Set<number>();

  // Add missing years
  missingYearsList.forEach((year) => yearsWithIssues.add(year));

  // Add outlier years
  validatedOutliers.forEach((outlier) => yearsWithIssues.add(outlier.year));

  // Add unusual point years
  unusualPoints.forEach((point) => yearsWithIssues.add(point.year));

  const uniqueYearsWithIssues = yearsWithIssues.size;

  // Step 7: Assess data quality
  const issues: string[] = [];

  if (cleanDataPoints < 3) {
    issues.push("limitedDataPoints");
  }

  if (uniqueYearsWithIssues > 0) {
    issues.push("dataQualityIssues");
  }

  // Check for high variance in clean data
  if (cleanDataPoints >= 3) {
    const statistics = calculateBasicStatistics(cleanData);
    const coefficientOfVariation = statistics.stdDev / (statistics.mean || 1);
    if (coefficientOfVariation > 0.5) {
      issues.push("highVariance");
    }
  }

  const issueCount = issues.length;

  // Step 8: Determine if data quality is poor
  // Data quality is considered poor if:
  // - Less than 3 clean data points, OR
  // - Multiple data quality issues (missing years, outliers, unusual points, high variance)
  const isPoorDataQuality = cleanDataPoints < 3 || issueCount > 2;

  // Step 9: Method selection based on data quality
  if (isPoorDataQuality) {
    // Check if there's insufficient data (≤1 usable data point)
    if (cleanDataPoints <= 1) {
      // No trendline shown due to insufficient data
      const explanation = baseYear
        ? "trendAnalysis.insufficientDataSinceBaseYear"
        : "trendAnalysis.insufficientData";
      const explanationParams: Record<string, string | number> = baseYear
        ? { baseYear, dataPoints: cleanDataPoints }
        : { dataPoints: cleanDataPoints };

      return {
        method: "none",
        explanation,
        explanationParams,
        coefficients: undefined,
        cleanData: [],
        excludedData: {
          missingYears: missingYearsList,
          outliers: validatedOutliers,
          unusualPoints,
        },
        issues: ["insufficientData"],
        issueCount: 1,
        originalDataPoints,
        cleanDataPoints,
        missingYearsCount: missingYearsList.length,
        outliersCount: validatedOutliers.length,
        unusualPointsCount: unusualPoints.length,
      };
    } else if (cleanDataPoints < 3) {
      // Poor data quality with <3 clean data points - use simple method
      const method = "simple";
      const coefficients = calculateSimpleCoefficients(cleanData);

      return {
        method,
        explanation: "trendAnalysis.simpleMethodPoorDataQuality",
        explanationParams: {
          issues: issues.join(", "),
          cleanDataPoints,
          originalDataPoints,
        },
        coefficients,
        cleanData,
        excludedData: {
          missingYears: missingYearsList,
          outliers: validatedOutliers,
          unusualPoints,
        },
        issues,
        issueCount,
        originalDataPoints,
        cleanDataPoints,
        missingYearsCount: missingYearsList.length,
        outliersCount: validatedOutliers.length,
        unusualPointsCount: unusualPoints.length,
      };
    } else {
      // Poor data quality but >=3 clean data points - use linear regression on clean data
      const method = "linear";
      const coefficients = calculateCoefficientsForMethod(cleanData, method);

      return {
        method,
        explanation: "trendAnalysis.linearMethodMultipleIssues",
        explanationParams: {
          issues: issues.join(", "),
          cleanDataPoints,
          originalDataPoints,
        },
        coefficients,
        cleanData,
        excludedData: {
          missingYears: missingYearsList,
          outliers: validatedOutliers,
          unusualPoints,
        },
        issues,
        issueCount,
        originalDataPoints,
        cleanDataPoints,
        missingYearsCount: missingYearsList.length,
        outliersCount: validatedOutliers.length,
        unusualPointsCount: unusualPoints.length,
      };
    }
  }

  // Step 10: Use sophisticated method selection logic for good quality data
  // This is only reached if data quality is decent (>=3 clean data points and <=2 issues)
  const recentStability = calculateRecentStability(cleanData);
  const r2Lin = calculateR2Linear(cleanData);
  const r2Exp = calculateR2Exponential(cleanData);
  const statistics = calculateBasicStatistics(cleanData);

  // Simplified sophisticated method selection logic for good quality data
  // 1. Recent exponential pattern (most relevant for future projections)
  if (cleanData.length >= 4) {
    const recentData = cleanData.slice(-4);
    const recentR2Exp = calculateR2Exponential(recentData);
    const recentR2Lin = calculateR2Linear(recentData);

    // Only use exponential if it's significantly better AND the data actually shows exponential growth
    if (recentR2Exp > 0.7 && recentR2Exp - recentR2Lin > 0.1) {
      // Additional check: verify the exponential coefficients are reasonable
      const expCoefficients = calculateCoefficientsForMethod(
        recentData,
        "recentExponential",
      );
      if (expCoefficients && "a" in expCoefficients && "b" in expCoefficients) {
        // Check if the exponential growth rate is reasonable (not too steep)
        const b = expCoefficients.b;
        if (Math.abs(b) < 0.3) {
          // Limit growth rate to prevent unrealistic projections
          const method = "recentExponential";
          const coefficients = calculateCoefficientsForMethod(
            cleanData,
            method,
          );
          return {
            method,
            explanation: "trendAnalysis.recentExponentialMethodStrongPattern",
            explanationParams: {
              r2Exp: recentR2Exp.toFixed(2),
              r2Lin: recentR2Lin.toFixed(2),
            },
            coefficients,
            cleanData,
            excludedData: {
              missingYears: missingYearsList,
              outliers: validatedOutliers,
              unusualPoints,
            },
            issues,
            issueCount,
            originalDataPoints,
            cleanDataPoints,
            missingYearsCount: missingYearsList.length,
            outliersCount: validatedOutliers.length,
            unusualPointsCount: unusualPoints.length,
          };
        }
      }
    }
  }

  // 2. Overall exponential fit (if exponential fits significantly better)
  if (r2Exp - r2Lin > 0.05) {
    // Additional check: verify the exponential coefficients are reasonable
    const expCoefficients = calculateCoefficientsForMethod(
      cleanData,
      "exponential",
    );
    if (expCoefficients && "a" in expCoefficients && "b" in expCoefficients) {
      // Check if the exponential growth rate is reasonable (not too steep)
      const b = expCoefficients.b;
      if (Math.abs(b) < 0.3) {
        // Limit growth rate to prevent unrealistic projections
        const method = "exponential";
        const coefficients = calculateCoefficientsForMethod(cleanData, method);
        return {
          method,
          explanation: "trendAnalysis.exponentialMethodBetterFit",
          explanationParams: {
            r2Exp: r2Exp.toFixed(2),
            r2Lin: r2Lin.toFixed(2),
          },
          coefficients,
          cleanData,
          excludedData: {
            missingYears: missingYearsList,
            outliers: validatedOutliers,
            unusualPoints,
          },
          issues,
          issueCount,
          originalDataPoints,
          cleanDataPoints,
          missingYearsCount: missingYearsList.length,
          outliersCount: validatedOutliers.length,
          unusualPointsCount: unusualPoints.length,
        };
      }
    }
  }

  // 3. Recent stability (weighted linear when recent years are stable)
  if (recentStability < 0.1 && cleanData.length >= 4) {
    const method = "weightedLinear";
    const coefficients = calculateCoefficientsForMethod(cleanData, method);
    return {
      method,
      explanation: "trendAnalysis.weightedLinearMethodStable",
      coefficients,
      cleanData,
      excludedData: {
        missingYears: missingYearsList,
        outliers: validatedOutliers,
        unusualPoints,
      },
      issues,
      issueCount,
      originalDataPoints,
      cleanDataPoints,
      missingYearsCount: missingYearsList.length,
      outliersCount: validatedOutliers.length,
      unusualPointsCount: unusualPoints.length,
    };
  }

  // 4. Default to linear regression
  const method = "linear";
  const coefficients = calculateCoefficientsForMethod(cleanData, method);
  return {
    method,
    explanation: "trendAnalysis.linearMethodDefault",
    coefficients,
    cleanData,
    excludedData: {
      missingYears: missingYearsList,
      outliers: validatedOutliers,
      unusualPoints,
    },
    issues,
    issueCount,
    originalDataPoints,
    cleanDataPoints,
    missingYearsCount: missingYearsList.length,
    outliersCount: validatedOutliers.length,
    unusualPointsCount: unusualPoints.length,
  };
}

/**
 * Calculates simple coefficients using the last two data points
 * @param dataPoints Array of data points for analysis
 * @returns Coefficients object or null if calculation fails
 */
function calculateSimpleCoefficients(
  dataPoints: DataPoint[],
): { slope: number; intercept: number } | undefined {
  if (dataPoints.length < 2) {
    return undefined;
  }

  // Sort by year to ensure chronological order
  const sortedData = [...dataPoints].sort((a, b) => a.year - b.year);

  // Use the last two data points
  const lastTwo = sortedData.slice(-2);
  const [point1, point2] = lastTwo;

  // Calculate slope between the last two points
  const slope = (point2.value - point1.value) / (point2.year - point1.year);

  // Calculate intercept using point1
  const intercept = point1.value - slope * point1.year;

  return { slope, intercept };
}

/**
 * Calculates coefficients for the specified trend line method.
 * @param dataPoints Array of data points for analysis
 * @param method The selected trend line method
 * @returns Coefficients object or null if calculation fails
 */
function calculateCoefficientsForMethod(
  dataPoints: DataPoint[],
  method: string,
): { slope: number; intercept: number } | { a: number; b: number } | undefined {
  if (dataPoints.length < 2) {
    return undefined;
  }

  switch (method) {
    case "linear":
      return calculateLinearRegression(dataPoints) || undefined;

    case "weightedLinear":
      return calculateWeightedLinearRegression(dataPoints) || undefined;

    case "exponential":
      return fitExponentialRegression(dataPoints) || undefined;

    case "recentExponential":
      if (dataPoints.length >= 4) {
        const recentData = dataPoints.slice(-4);
        return fitExponentialRegression(recentData) || undefined;
      }
      return fitExponentialRegression(dataPoints) || undefined;

    case "simple":
      // For simple method, use the last two points
      return calculateSimpleCoefficients(dataPoints) || undefined;

    default:
      return calculateLinearRegression(dataPoints) || undefined;
  }
}

/**
 * Enhanced unusual points detection that considers both relative and absolute changes
 */
export function detectUnusualEmissionsPointsEnhanced(
  data: DataPoint[],
  relativeThreshold: number = 4,
  absoluteThreshold: number = 0.5, // 50% change
): {
  hasUnusualPoints: boolean;
  details?: {
    year: number;
    fromYear: number;
    toYear: number;
    fromValue: number;
    toValue: number;
    relativeChange: number;
    absoluteChange: number;
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

  // Calculate year-over-year changes
  const yearOverYearChanges: Array<{
    relativeChange: number;
    absoluteChange: number;
    fromYear: number;
    toYear: number;
    fromValue: number;
    toValue: number;
  }> = [];

  for (let i = 1; i < values.length; i++) {
    const currentValue = values[i];
    const previousValue = values[i - 1];
    if (previousValue !== 0) {
      const relativeChange = Math.abs(
        (currentValue - previousValue) / previousValue,
      );
      const absoluteChange = Math.abs(
        (currentValue - previousValue) / Math.max(currentValue, previousValue),
      );
      yearOverYearChanges.push({
        relativeChange,
        absoluteChange,
        fromYear: years[i - 1],
        toYear: years[i],
        fromValue: previousValue,
        toValue: currentValue,
      });
    }
  }

  if (yearOverYearChanges.length === 0) {
    return { hasUnusualPoints: false };
  }

  // Calculate thresholds
  const relativeChanges = yearOverYearChanges.map((c) => c.relativeChange);

  const medianRelativeChange = getMedian(relativeChanges);

  const relativeThresholdValue = relativeThreshold * medianRelativeChange;
  const absoluteThresholdValue = absoluteThreshold;

  // Find unusual points that exceed BOTH thresholds
  const unusualChanges = yearOverYearChanges.filter(
    (change) =>
      change.relativeChange > relativeThresholdValue &&
      change.absoluteChange > absoluteThresholdValue,
  );

  const hasUnusualPoints = unusualChanges.length > 0;

  // Create detailed information about unusual points
  const details = unusualChanges.map((change) => {
    const direction =
      change.toValue > change.fromValue ? "increase" : "decrease";

    return {
      year: change.toYear,
      fromYear: change.fromYear,
      toYear: change.toYear,
      fromValue: change.fromValue,
      toValue: change.toValue,
      relativeChange: change.relativeChange * 100, // Convert to percentage
      absoluteChange: change.absoluteChange * 100, // Convert to percentage
      threshold: Math.max(relativeThresholdValue, absoluteThresholdValue) * 100,
      direction,
      reason: `${change.fromYear}→${change.toYear}: ${(change.relativeChange * 100).toFixed(1)}% relative, ${(change.absoluteChange * 100).toFixed(1)}% absolute ${direction}`,
    };
  });

  return {
    hasUnusualPoints,
    details: hasUnusualPoints ? details : undefined,
  };
}

/**
 * Get median value from array of numbers
 */
function getMedian(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}
