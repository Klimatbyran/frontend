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
