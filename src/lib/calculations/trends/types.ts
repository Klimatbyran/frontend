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
 * Trend analysis result for a company
 * Contains essential metrics for trendline display and analysis
 */
export interface TrendAnalysis {
  // Core trend information
  method: string;
  explanation: string;
  explanationParams?: Record<string, string | number>;
  coefficients?:
    | { slope: number; intercept: number }
    | { a: number; b: number };

  // Display metrics
  cleanDataPoints: number;
  trendDirection: "increasing" | "decreasing" | "stable";
  yearlyPercentageChange: number;

  // Optional legacy fields for backward compatibility
  companyId?: string;
  companyName?: string;
  baseYear?: number;
  originalDataPoints?: number;
  missingYearsCount?: number;
  outliersCount?: number;
  unusualPointsCount?: number;
  excludedData?: {
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
  issues?: string[];
  issueCount?: number;
  dataPoints?: number;
  missingYears?: number;
  hasUnusualPoints?: boolean;
}
