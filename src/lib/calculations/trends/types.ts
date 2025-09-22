/**
 * Standardized data format for all trend/statistics functions
 *
 * This is the canonical format for statistical analysis functions.
 * Legacy code may still use { x, y } or { year, total } formats in some places,
 * but new code should use this standardized format.
 */
export interface DataPoint {
  year: number;
  value: number;
}

/**
 * Comprehensive trend analysis result for a company
 * Contains all calculated metrics and analysis results
 */
export interface TrendAnalysis {
  companyId: string;
  companyName: string;
  method: string;
  explanation: string;
  explanationParams?: Record<string, string | number>;
  coefficients?:
    | { slope: number; intercept: number }
    | { a: number; b: number };
  baseYear?: number;

  // Data metrics
  originalDataPoints: number;
  cleanDataPoints: number;
  missingYearsCount: number;
  outliersCount: number;
  unusualPointsCount: number;

  // Excluded data for reference
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
      fromYear: number;
      toYear: number;
      fromValue: number;
      toValue: number;
      relativeChange: number;
      absoluteChange: number;
      direction: string;
      details: string;
    }>;
  };

  // Quality assessment
  issues: string[];
  issueCount: number;

  dataPoints: number; // This will be cleanDataPoints
  missingYears: number; // This will be missingYearsCount
  hasUnusualPoints: boolean;
  trendDirection: "increasing" | "decreasing" | "stable";
  yearlyPercentageChange: number;
}
