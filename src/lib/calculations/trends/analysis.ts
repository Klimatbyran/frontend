/**
 * Trend Analysis Functions
 */

import { DataPoint, TrendAnalysis } from "./types";
import {
  calculateR2Linear,
  calculateR2Exponential,
  calculateBasicStatistics,
  calculateRecentStability,
  analyzeTrendCharacteristics,
} from "./statistics";
import { createInsufficientDataAnalysis } from "./utils";
import {
  getMissingYearsList,
  getValidDataSinceBaseYear,
} from "./data-processing";
import {
  validateOutliersWithScope3,
  detectUnusualEmissionsPointsEnhanced,
} from "./outlier-detection";
import {
  calculateSimpleCoefficients,
  calculateCoefficientsForMethod,
} from "./regression";

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
    dataPoints: trendResult.cleanDataPoints,
    missingYears: trendResult.missingYearsCount,
    hasUnusualPoints: unusualPointsResult.hasUnusualPoints,
    trendDirection: trendDirection,
    yearlyPercentageChange,
  };
};

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
    phaseChanges: Array<{
      year: number;
      fromValue: number;
      toValue: number;
      changePercentage: number;
      reason: string;
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
      excludedData: {
        missingYears: [],
        outliers: [],
        unusualPoints: [],
        phaseChanges: [],
      },
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

  // Step 5: Create clean dataset with phase-aware filtering
  let cleanData: DataPoint[];

  // Apply phase-aware filtering if we have enough data points
  if (
    dataPoints.length > 4 &&
    unusualPointsResult.phaseChanges &&
    unusualPointsResult.phaseChanges.length > 0
  ) {
    // Filter out phase change years to focus on the most recent stable phase
    const phaseChangeYears = new Set(
      unusualPointsResult.phaseChanges.map((pc) => pc.year),
    );

    console.log("Phase-aware filtering applied:", {
      totalDataPoints: dataPoints.length,
      phaseChanges: unusualPointsResult.phaseChanges,
      filteredOutYears: Array.from(phaseChangeYears),
      remainingDataPoints: dataPoints.length - phaseChangeYears.size,
      originalData: dataPoints.map((d) => ({ year: d.year, value: d.value })),
    });

    cleanData = dataPoints.filter((point) => {
      const isOutlier = validatedOutliers.some(
        (outlier) => outlier.year === point.year,
      );
      const isMissing = missingYearsList.includes(point.year);
      const isPhaseChange = phaseChangeYears.has(point.year);

      return !isOutlier && !isMissing && !isPhaseChange;
    });

    console.log("After phase-aware filtering:", {
      cleanData: cleanData.map((d) => ({ year: d.year, value: d.value })),
      removedPoints: dataPoints
        .filter((point) => {
          const isOutlier = validatedOutliers.some(
            (outlier) => outlier.year === point.year,
          );
          const isMissing = missingYearsList.includes(point.year);
          const isPhaseChange = phaseChangeYears.has(point.year);
          return isOutlier || isMissing || isPhaseChange;
        })
        .map((d) => ({ year: d.year, value: d.value })),
    });
  } else {
    // Use standard filtering (exclude outliers and missing years, but keep unusual points that aren't outliers)
    cleanData = dataPoints.filter((point) => {
      const isOutlier = validatedOutliers.some(
        (outlier) => outlier.year === point.year,
      );
      const isMissing = missingYearsList.includes(point.year);
      return !isOutlier && !isMissing;
    });
  }

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
          phaseChanges: unusualPointsResult.phaseChanges || [],
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

      console.log(
        "Simple method selected - cleanData used for trend calculation:",
        {
          method,
          cleanDataPoints,
          cleanData: cleanData.map((d) => ({ year: d.year, value: d.value })),
          coefficients,
        },
      );

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
          phaseChanges: unusualPointsResult.phaseChanges || [],
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
          phaseChanges: unusualPointsResult.phaseChanges || [],
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
              phaseChanges: unusualPointsResult.phaseChanges || [],
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
            phaseChanges: unusualPointsResult.phaseChanges || [],
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
    console.log("Method Selection: Weighted Linear chosen because:", {
      recentStability,
      cleanDataLength: cleanData.length,
      recentData: cleanData
        .slice(-4)
        .map((d) => ({ year: d.year, value: d.value })),
      fullCleanData: cleanData.map((d) => ({ year: d.year, value: d.value })),
    });
    const method = "weightedLinear";
    const coefficients = calculateCoefficientsForMethod(cleanData, method);

    console.log("Weighted Linear coefficients calculated:", {
      method,
      coefficients,
      dataUsed: cleanData.map((d) => ({ year: d.year, value: d.value })),
    });

    return {
      method,
      explanation: "trendAnalysis.weightedLinearMethodStable",
      coefficients,
      cleanData,
      excludedData: {
        missingYears: missingYearsList,
        outliers: validatedOutliers,
        unusualPoints,
        phaseChanges: unusualPointsResult.phaseChanges || [],
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
      phaseChanges: unusualPointsResult.phaseChanges || [],
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
