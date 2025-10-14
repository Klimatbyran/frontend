/**
 * Trend Analysis Functions
 */

import { TrendAnalysis } from "./types";
import { calculateBasicStatistics } from "./statistics";

/**
 * Creates trend analysis using API-provided trendline slope when available
 * Returns null if API slope is not available (backend determined insufficient data)
 */
export const processCompanyDataWithApiSlope = (
  company: any,
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

  const baseYear = company.baseYear?.year;
  const dataSinceBaseYear = baseYear
    ? data.filter((d: any) => d.year >= baseYear)
    : data;

  const dataPoints = dataSinceBaseYear.map((d: any) => ({
    year: d.year,
    value: d.total,
  }));

  // Data since base year: valid emissions data from base year onwards
  const dataSinceBaseYearCount = dataSinceBaseYear.length;

  const statistics = calculateBasicStatistics(dataPoints);

  // Use API-provided slope
  const apiSlope = company.futureEmissionsTrendSlope;

  // Calculate intercept using the last data point
  const lastDataPoint = dataPoints[dataPoints.length - 1];
  const intercept = lastDataPoint.value - apiSlope * lastDataPoint.year;

  // Calculate yearly percentage change using the API slope
  const yearlyPercentageChange =
    statistics.mean > 0 ? (apiSlope / statistics.mean) * 100 : 0;

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
  };
};
