import type { CompanyDetails, RankedCompany } from "@/types/company";

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
 * Company type that can be used for trend analysis calculations.
 *
 * Both CompanyDetails (from detail endpoint) and RankedCompany (from list endpoint)
 * have the required properties: reportingPeriods, futureEmissionsTrendSlope, and baseYear.
 */
export type CompanyForTrendAnalysis = CompanyDetails | RankedCompany;

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
}
