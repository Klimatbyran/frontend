import type { TrendAnalysis, CompanyForTrendAnalysis } from "./types";

/**
 * Calculates trendline analysis using API-provided slope when available
 * Returns null if API slope is not available (backend determined insufficient data)
 */
export const calculateTrendline = (
  company: CompanyForTrendAnalysis,
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

  // Calculate intercept using the last data point (trendline passes through last point)
  const lastDataPoint = dataPoints[dataPoints.length - 1];
  const intercept = lastDataPoint.value - apiSlope * lastDataPoint.year;

  // Calculate yearly percentage change using the API slope
  // Use the last data point value as the reference (consistent with trendline anchor point)
  // However, if the last value is very small (potential data quality issue), use mean instead
  let yearlyPercentageChange = 0;
  if (lastDataPoint.value > 0) {
    const percentFromLast = (apiSlope / lastDataPoint.value) * 100;
    // If percentage is extremely large (>±200%), likely a data quality issue
    // Use mean as fallback for more stable percentage
    if (Math.abs(percentFromLast) > 200) {
      const mean =
        dataPoints.reduce((sum, d) => sum + d.value, 0) / dataPoints.length;
      const percentFromMean = mean > 0 ? (apiSlope / mean) * 100 : 0;
      // Cap at ±200% even when using mean (extreme values suggest data quality issues)
      yearlyPercentageChange = Math.max(-200, Math.min(200, percentFromMean));
    } else {
      yearlyPercentageChange = percentFromLast;
    }
  }

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
