import { DataPoint } from "@/types/emissions";
import {
  calculateParisValue,
  CARBON_LAW_REDUCTION_RATE,
} from "@/utils/calculations/emissionsCalculations";
import {
  adjustCarbonLawFromToday,
  adjustTrendFromToday,
  applyCurrentYearToDate,
  getChartYearPosition,
  getYearToDateContext,
  isBeforeTodayOnChart,
} from "@/utils/data/chartYearToDate";
import {
  calculateLinearRegressionSlope,
  CLIMATE_TRACE_BASE_YEAR,
  EmissionsByYear,
  getEmissionsForParisProjection,
  getEmissionsPointsFromBaseYear,
  PARIS_PROJECTION_END_YEAR,
  PARIS_PROJECTION_START_YEAR,
} from "@/utils/europe/climateTraceKpis";

const EMISSIONS_DATA_START_YEAR = CLIMATE_TRACE_BASE_YEAR;
const EMISSIONS_DATA_END_YEAR = PARIS_PROJECTION_END_YEAR;

function buildTrendRecord(
  emissionsByYear: EmissionsByYear,
): Record<number, number> {
  const points = getEmissionsPointsFromBaseYear(emissionsByYear);
  const slope = calculateLinearRegressionSlope(points);
  if (slope === null || points.length === 0) {
    return {};
  }

  const basePoint = points[0];
  const trend: Record<number, number> = {};

  for (
    let year = EMISSIONS_DATA_START_YEAR;
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
    let year = PARIS_PROJECTION_START_YEAR;
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

export function transformEuropeanCountryEmissionsData(
  emissionsByYear: EmissionsByYear,
  now: Date = new Date(),
): DataPoint[] {
  if (!emissionsByYear || Object.keys(emissionsByYear).length === 0) {
    return [];
  }

  const trend = buildTrendRecord(emissionsByYear);
  const carbonLaw = buildCarbonLawRecord(emissionsByYear);
  const regressionSlope = calculateLinearRegressionSlope(
    getEmissionsPointsFromBaseYear(emissionsByYear),
  );
  const carbonLawBaseValue =
    regressionSlope === null
      ? undefined
      : getEmissionsForParisProjection(emissionsByYear, regressionSlope);

  const years = new Set<number>();
  Object.keys(emissionsByYear).forEach((year) => years.add(Number(year)));
  Object.keys(trend).forEach((year) => years.add(Number(year)));
  Object.keys(carbonLaw).forEach((year) => years.add(Number(year)));

  const { calendarYear, yearProgress } = getYearToDateContext(now);
  const trendAtCalendarYear = trend[calendarYear];
  const trendAtNextYear = trend[calendarYear + 1];
  const carbonLawBaseYear = PARIS_PROJECTION_START_YEAR;

  return Array.from(years)
    .filter((year) => !isNaN(year))
    .sort((a, b) => a - b)
    .map((yearNum) => {
      const total = emissionsByYear[yearNum];
      const hideProjectionBeforeToday = isBeforeTodayOnChart(
        yearNum,
        calendarYear,
        yearProgress,
      );

      const trendValue =
        trend[yearNum] !== undefined && !hideProjectionBeforeToday
          ? adjustTrendFromToday(
              trend[yearNum],
              yearNum,
              calendarYear,
              yearProgress,
              trendAtCalendarYear,
              trendAtNextYear,
            )
          : undefined;

      const carbonLawValue = hideProjectionBeforeToday
        ? undefined
        : yearNum >= calendarYear && carbonLawBaseValue != null
          ? adjustCarbonLawFromToday(
              yearNum,
              calendarYear,
              yearProgress,
              carbonLawBaseYear,
              carbonLawBaseValue,
            )
          : carbonLaw[yearNum];

      return {
        year: getChartYearPosition(yearNum, calendarYear, yearProgress),
        total: applyCurrentYearToDate(
          total,
          yearNum,
          calendarYear,
          yearProgress,
        ),
        trend: trendValue,
        approximated: undefined,
        carbonLaw: carbonLawValue,
      };
    })
    .filter(
      (point) =>
        point.year >= EMISSIONS_DATA_START_YEAR &&
        point.year <= EMISSIONS_DATA_END_YEAR,
    );
}
