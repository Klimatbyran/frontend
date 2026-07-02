import {
  calculateCarbonLawCumulativeEmissions,
  calculateCumulativeEmissions,
} from "@/lib/calculations/trends/meetsParis";

export const CLIMATE_TRACE_CHART_START_YEAR = 1990;
export const CLIMATE_TRACE_BASE_YEAR = 2015;
export const CLIMATE_TRACE_REPORTED_END_YEAR = 2025;
export const CLIMATE_TRACE_PROJECTION_START_YEAR =
  CLIMATE_TRACE_REPORTED_END_YEAR + 1;
export const PARIS_PROJECTION_START_YEAR = CLIMATE_TRACE_REPORTED_END_YEAR;
export const PARIS_PROJECTION_END_YEAR = 2050;

/** Annual totals cover Jan–Dec; plot at the following year's boundary (1 Jan). */
export const CLIMATE_TRACE_CHART_YEAR_OFFSET = 1;

export function reportingYearToChartYear(reportingYear: number): number {
  return reportingYear + CLIMATE_TRACE_CHART_YEAR_OFFSET;
}

export function chartYearToReportingYear(chartYear: number): number {
  return chartYear - CLIMATE_TRACE_CHART_YEAR_OFFSET;
}

export type EmissionsByYear = Record<number, number>;

export function getReportedClimateTraceEmissionsByYear(
  emissionsByYear: EmissionsByYear,
  reportedEndYear: number = CLIMATE_TRACE_REPORTED_END_YEAR,
): EmissionsByYear {
  return Object.fromEntries(
    Object.entries(emissionsByYear).filter(
      ([year, value]) =>
        Number(year) <= reportedEndYear &&
        value !== undefined &&
        value !== null &&
        !Number.isNaN(Number(value)),
    ),
  );
}

export function getClimateTraceReportedEndYear(
  emissionsByYear: EmissionsByYear,
  reportedEndYear: number = CLIMATE_TRACE_REPORTED_END_YEAR,
): number | undefined {
  const reportedYears = Object.keys(
    getReportedClimateTraceEmissionsByYear(emissionsByYear, reportedEndYear),
  )
    .map(Number)
    .filter((year) => !Number.isNaN(year));

  return reportedYears.length > 0 ? Math.max(...reportedYears) : undefined;
}

export function calculateLinearRegressionSlope(
  points: { year: number; value: number }[],
): number | null {
  if (points.length < 2) {
    return null;
  }

  const meanX =
    points.reduce((sum, point) => sum + point.year, 0) / points.length;
  const meanY =
    points.reduce((sum, point) => sum + point.value, 0) / points.length;

  const numerator = points.reduce(
    (sum, point) => sum + (point.year - meanX) * (point.value - meanY),
    0,
  );
  const denominator = points.reduce(
    (sum, point) => sum + (point.year - meanX) ** 2,
    0,
  );

  if (denominator === 0) {
    return null;
  }

  return numerator / denominator;
}

export function getEmissionsPointsFromBaseYear(
  emissionsByYear: EmissionsByYear,
  baseYear: number = CLIMATE_TRACE_BASE_YEAR,
): { year: number; value: number }[] {
  return Object.entries(emissionsByYear)
    .map(([year, value]) => ({ year: Number(year), value }))
    .filter(
      (point) =>
        point.year >= baseYear &&
        Number.isFinite(point.value) &&
        point.value > 0,
    )
    .sort((a, b) => a.year - b.year);
}

export function calculateHistoricalEmissionChangePercent(
  emissionsByYear: EmissionsByYear,
  baseYear: number = CLIMATE_TRACE_BASE_YEAR,
  reportedEndYear: number = CLIMATE_TRACE_REPORTED_END_YEAR,
): number | null {
  const reportedEmissionsByYear = getReportedClimateTraceEmissionsByYear(
    emissionsByYear,
    reportedEndYear,
  );
  const baseYearEmissions = reportedEmissionsByYear[baseYear];
  if (!baseYearEmissions || baseYearEmissions <= 0) {
    return null;
  }

  const latestYear = getClimateTraceReportedEndYear(
    reportedEmissionsByYear,
    reportedEndYear,
  );
  if (!latestYear || latestYear <= baseYear) {
    return null;
  }

  const latestEmissions = reportedEmissionsByYear[latestYear];
  if (!latestEmissions || latestEmissions <= 0) {
    return null;
  }

  const yearSpan = latestYear - baseYear;
  const cagr = (latestEmissions / baseYearEmissions) ** (1 / yearSpan) - 1;

  return cagr * 100;
}

export function getEmissionsForParisProjection(
  emissionsByYear: EmissionsByYear,
  slope: number,
  projectionYear: number = PARIS_PROJECTION_START_YEAR,
): number | null {
  const actualProjectionYearEmissions = emissionsByYear[projectionYear];
  if (actualProjectionYearEmissions && actualProjectionYearEmissions > 0) {
    return actualProjectionYearEmissions;
  }

  const points = getEmissionsPointsFromBaseYear(emissionsByYear);
  if (points.length === 0) {
    return null;
  }

  const latestPoint = points[points.length - 1];
  if (latestPoint.year >= projectionYear) {
    return latestPoint.value > 0 ? latestPoint.value : null;
  }

  const yearsFromLatest = projectionYear - latestPoint.year;
  const projectedEmissions = latestPoint.value + slope * yearsFromLatest;

  return projectedEmissions > 0 ? projectedEmissions : null;
}

export function calculateMeetsParisFromTimeSeries(
  emissionsByYear: EmissionsByYear,
  baseYear: number = CLIMATE_TRACE_BASE_YEAR,
): boolean | null {
  const points = getEmissionsPointsFromBaseYear(emissionsByYear, baseYear);
  if (points.length < 2) {
    return null;
  }

  const slope = calculateLinearRegressionSlope(points);
  if (slope === null) {
    return null;
  }

  const emissions2025 = getEmissionsForParisProjection(emissionsByYear, slope);
  if (emissions2025 === null) {
    return null;
  }

  if (emissions2025 <= 0) {
    return true;
  }

  const trendCumulativeEmissions = calculateCumulativeEmissions(
    emissions2025,
    slope,
    PARIS_PROJECTION_START_YEAR,
    PARIS_PROJECTION_END_YEAR,
  );

  const carbonLawCumulativeEmissions = calculateCarbonLawCumulativeEmissions(
    emissions2025,
    PARIS_PROJECTION_START_YEAR,
    PARIS_PROJECTION_END_YEAR,
  );

  return trendCumulativeEmissions <= carbonLawCumulativeEmissions;
}

export function calculateClimateTraceCountryKpis(
  emissionsByYear: EmissionsByYear,
): {
  historicalEmissionChangePercent: number | null;
  meetsParis: boolean | null;
} {
  const reportedEmissionsByYear =
    getReportedClimateTraceEmissionsByYear(emissionsByYear);

  return {
    historicalEmissionChangePercent: calculateHistoricalEmissionChangePercent(
      reportedEmissionsByYear,
    ),
    meetsParis: calculateMeetsParisFromTimeSeries(reportedEmissionsByYear),
  };
}
