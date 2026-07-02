import { DataPoint } from "@/types/emissions";
import {
  calculateParisValue,
  CARBON_LAW_REDUCTION_RATE,
} from "@/utils/calculations/emissionsCalculations";
import {
  calculateLinearRegressionSlope,
  CLIMATE_TRACE_BASE_YEAR,
  CLIMATE_TRACE_REPORTED_END_YEAR,
  EmissionsByYear,
  getEmissionsForParisProjection,
  getEmissionsPointsFromBaseYear,
  getReportedClimateTraceEmissionsByYear,
  PARIS_PROJECTION_END_YEAR,
  PARIS_PROJECTION_START_YEAR,
  reportingYearToChartYear,
} from "@/utils/europe/climateTraceKpis";

const EMISSIONS_DATA_START_YEAR = CLIMATE_TRACE_BASE_YEAR;
const EMISSIONS_DATA_END_YEAR = PARIS_PROJECTION_END_YEAR;

function buildTrendRecord(
  emissionsByYear: EmissionsByYear,
  projectionStartYear: number,
): Record<number, number> {
  const points = getEmissionsPointsFromBaseYear(emissionsByYear);
  const slope = calculateLinearRegressionSlope(points);
  if (slope === null || points.length === 0) {
    return {};
  }

  const basePoint = points[0];
  const trend: Record<number, number> = {};

  for (
    let year = projectionStartYear;
    year <= EMISSIONS_DATA_END_YEAR;
    year++
  ) {
    const projected = basePoint.value + slope * (year - basePoint.year);
    if (projected > 0) {
      trend[year] = projected;
    }
  }

  return trend;
}

function buildCarbonLawRecord(
  emissionsByYear: EmissionsByYear,
  projectionStartYear: number,
): Record<number, number> {
  const points = getEmissionsPointsFromBaseYear(emissionsByYear);
  const slope = calculateLinearRegressionSlope(points);
  if (slope === null) {
    return {};
  }

  const emissions2025 = getEmissionsForParisProjection(emissionsByYear, slope);
  if (emissions2025 === null) {
    return {};
  }

  const carbonLaw: Record<number, number> = {};
  for (
    let year = projectionStartYear;
    year <= EMISSIONS_DATA_END_YEAR;
    year++
  ) {
    const value = calculateParisValue(
      year,
      PARIS_PROJECTION_START_YEAR,
      emissions2025,
      CARBON_LAW_REDUCTION_RATE,
    );
    if (value !== null && value > 0) {
      carbonLaw[year] = value;
    }
  }

  return carbonLaw;
}

function upsertChartPoint(
  pointsByChartYear: Map<number, DataPoint>,
  chartYear: number,
  patch: Partial<DataPoint>,
): void {
  const existing = pointsByChartYear.get(chartYear) ?? {
    year: chartYear,
    total: undefined,
    trend: undefined,
    approximated: undefined,
    carbonLaw: undefined,
  };

  pointsByChartYear.set(chartYear, { ...existing, ...patch, year: chartYear });
}

export function transformEuropeanCountryEmissionsData(
  emissionsByYear: EmissionsByYear,
): DataPoint[] {
  if (!emissionsByYear || Object.keys(emissionsByYear).length === 0) {
    return [];
  }

  const reportedEmissionsByYear = getReportedClimateTraceEmissionsByYear(
    emissionsByYear,
    CLIMATE_TRACE_REPORTED_END_YEAR,
  );
  const trend = buildTrendRecord(
    reportedEmissionsByYear,
    PARIS_PROJECTION_START_YEAR,
  );
  const carbonLaw = buildCarbonLawRecord(
    reportedEmissionsByYear,
    PARIS_PROJECTION_START_YEAR,
  );

  const pointsByChartYear = new Map<number, DataPoint>();

  for (const [year, total] of Object.entries(reportedEmissionsByYear)) {
    const reportingYear = Number(year);
    if (Number.isNaN(reportingYear)) {
      continue;
    }

    upsertChartPoint(
      pointsByChartYear,
      reportingYearToChartYear(reportingYear),
      {
        total,
      },
    );
  }

  for (const [year, value] of Object.entries(trend)) {
    const reportingYear = Number(year);
    if (
      Number.isNaN(reportingYear) ||
      reportingYear < PARIS_PROJECTION_START_YEAR
    ) {
      continue;
    }

    upsertChartPoint(
      pointsByChartYear,
      reportingYearToChartYear(reportingYear),
      { trend: value },
    );
  }

  for (const [year, value] of Object.entries(carbonLaw)) {
    const reportingYear = Number(year);
    if (
      Number.isNaN(reportingYear) ||
      reportingYear < PARIS_PROJECTION_START_YEAR
    ) {
      continue;
    }

    upsertChartPoint(
      pointsByChartYear,
      reportingYearToChartYear(reportingYear),
      { carbonLaw: value },
    );
  }

  const minChartYear = reportingYearToChartYear(EMISSIONS_DATA_START_YEAR);
  const maxChartYear = reportingYearToChartYear(EMISSIONS_DATA_END_YEAR);

  return Array.from(pointsByChartYear.values())
    .filter((point) => point.year >= minChartYear && point.year <= maxChartYear)
    .sort((a, b) => a.year - b.year);
}
