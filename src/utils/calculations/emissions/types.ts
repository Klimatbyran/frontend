/**
 * Shared type definitions for emissions calculations
 */

export interface TrendCoefficients {
  slope: number;
  intercept: number;
}

export interface ApproximatedHistoricalResult {
  approximatedData: Record<number, number>;
  cumulativeEmissions: number;
  trendCoefficients: TrendCoefficients;
}

export interface FutureTrendResult {
  trendData: Record<number, number>;
  cumulativeEmissions: number;
  trendCoefficients: TrendCoefficients;
}

export interface ExponentialFit {
  a: number;
  b: number;
}

/**
 * Available modes for sophisticated trend calculations.
 * - "linear": Uses linear regression for trend calculations
 * - "exponential": Uses exponential regression for trend calculations
 */
export type SophisticatedTrendMode = "linear" | "exponential";
