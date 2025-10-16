import { TrendAnalysis } from "./types";
import type { CompanyDetails, RankedCompany } from "@/types/company";

/**
 * Calculate mean value from array of numbers
 */
function calculateMean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Calculates trendline analysis using API-provided slope when available
 * Returns null if API slope is not available (backend determined insufficient data)
 */
export const calculateTrendline = (
  company: CompanyDetails | RankedCompany,
): TrendAnalysis | null => {
  // Early return if API doesn't provide slope (backend determined insufficient data)
  if (
    company.futureEmissionsTrendSlope === null ||
    company.futureEmissionsTrendSlope === undefined
  ) {
    return null;
  }

  // Build trend analysis using API-provided slope
  const data = company.reportingPeriods
    .filter(
      (period) =>
        period.emissions &&
        period.emissions.calculatedTotalEmissions !== null &&
        period.emissions.calculatedTotalEmissions !== undefined,
    )
    .map((period) => ({
      year: new Date(period.endDate).getFullYear(),
      total: period.emissions!.calculatedTotalEmissions!,
    }))
    .sort((a, b) => a.year - b.year);

  const baseYear = company.baseYear?.year;
  const dataSinceBaseYear = baseYear
    ? data.filter((d) => d.year >= baseYear)
    : data;

  const dataPoints = dataSinceBaseYear.map((d) => ({
    year: d.year,
    value: d.total,
  }));

  // Data since base year: valid emissions data from base year onwards
  const dataSinceBaseYearCount = dataSinceBaseYear.length;

  // Use API-provided slope
  const apiSlope = company.futureEmissionsTrendSlope;

  // Calculate intercept using the last data point
  const lastDataPoint = dataPoints[dataPoints.length - 1];
  const intercept = lastDataPoint.value - apiSlope * lastDataPoint.year;

  // Calculate yearly percentage change using the API slope
  const mean = calculateMean(dataPoints.map((d) => d.value));
  const yearlyPercentageChange = mean > 0 ? (apiSlope / mean) * 100 : 0;

  // Determine trend direction based on API slope
  const trendDirection: "increasing" | "decreasing" | "stable" =
    Math.abs(apiSlope) < 0.01
      ? "stable"
      : apiSlope > 0
        ? "increasing"
        : "decreasing";

  return {
    method: "api-provided",
    explanation: "API-provided trendline",
    explanationParams: { slope: apiSlope.toFixed(4) },
    coefficients: { slope: apiSlope, intercept },
    cleanDataPoints: dataSinceBaseYearCount,
    trendDirection: trendDirection,
    yearlyPercentageChange,
    // TODO: Remove method, explanation, and explanationParams when explore mode is updated
    // These are only used in explore mode and can be cleaned up in future refactoring
  };
};
