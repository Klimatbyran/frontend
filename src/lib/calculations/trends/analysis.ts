import type { TrendAnalysis, CompanyForTrendAnalysis } from "./types";

type TrendDataPoint = { year: number; value: number };

function buildTrendDataPoints(
  company: CompanyForTrendAnalysis,
): TrendDataPoint[] {
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

  return dataSinceBaseYear.map((d) => ({
    year: d.year,
    value: d.total,
  }));
}

function calculateYearlyPercentageChange(
  apiSlope: number,
  dataPoints: TrendDataPoint[],
): number {
  const lastDataPoint = dataPoints[dataPoints.length - 1];
  if (lastDataPoint.value <= 0) {
    return 0;
  }

  const percentFromLast = (apiSlope / lastDataPoint.value) * 100;
  if (Math.abs(percentFromLast) <= 200) {
    return percentFromLast;
  }

  const mean =
    dataPoints.reduce((sum, d) => sum + d.value, 0) / dataPoints.length;
  const percentFromMean = mean > 0 ? (apiSlope / mean) * 100 : 0;
  return Math.max(-200, Math.min(200, percentFromMean));
}

function getTrendDirection(
  apiSlope: number,
): "increasing" | "decreasing" | "stable" {
  if (Math.abs(apiSlope) < 0.01) {
    return "stable";
  }
  return apiSlope > 0 ? "increasing" : "decreasing";
}

/**
 * Calculates trendline analysis using API-provided slope when available
 * Returns null if API slope is not available (backend determined insufficient data)
 */
export const calculateTrendline = (
  company: CompanyForTrendAnalysis,
): TrendAnalysis | null => {
  if (
    company.futureEmissionsTrendSlope === null ||
    company.futureEmissionsTrendSlope === undefined
  ) {
    return null;
  }

  const dataPoints = buildTrendDataPoints(company);
  const apiSlope = company.futureEmissionsTrendSlope;
  const lastDataPoint = dataPoints[dataPoints.length - 1];
  const intercept = lastDataPoint.value - apiSlope * lastDataPoint.year;
  const yearlyPercentageChange = calculateYearlyPercentageChange(
    apiSlope,
    dataPoints,
  );

  return {
    method: "api-provided",
    explanation: "API-provided trendline",
    explanationParams: { slope: apiSlope.toFixed(4) },
    coefficients: { slope: apiSlope, intercept },
    cleanDataPoints: dataPoints.length,
    trendDirection: getTrendDirection(apiSlope),
    yearlyPercentageChange,
  };
};
