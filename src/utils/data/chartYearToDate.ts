import {
  calculateParisValue,
  CARBON_LAW_REDUCTION_RATE,
} from "@/utils/calculations/emissionsCalculations";
import { getYearProgress } from "@/utils/data/yearUtils";

export function isPartialCurrentYear(
  yearNum: number,
  calendarYear: number,
  yearProgress: number,
): boolean {
  return yearNum === calendarYear && yearProgress > 0 && yearProgress < 1;
}

export function getChartYearPosition(
  yearNum: number,
  calendarYear: number,
  yearProgress: number,
): number {
  return isPartialCurrentYear(yearNum, calendarYear, yearProgress)
    ? yearNum + yearProgress
    : yearNum;
}

export function applyCurrentYearToDate<T extends number | undefined>(
  value: T,
  yearNum: number,
  calendarYear: number,
  yearProgress: number,
): T {
  if (value === undefined || yearNum !== calendarYear || yearProgress >= 1) {
    return value;
  }

  return (value * yearProgress) as T;
}

/** Project trend from today's position instead of Jan 1 full-year regression points. */
export function adjustTrendFromToday(
  trend: number | undefined,
  yearNum: number,
  calendarYear: number,
  yearProgress: number,
  trendAtCalendarYear: number | undefined,
  trendAtNextYear: number | undefined,
): number | undefined {
  if (
    trend === undefined ||
    yearNum < calendarYear ||
    yearProgress <= 0 ||
    yearProgress >= 1 ||
    trendAtCalendarYear === undefined
  ) {
    return trend;
  }

  const annualSlope =
    trendAtNextYear !== undefined ? trendAtNextYear - trendAtCalendarYear : 0;
  const todayPosition = calendarYear + yearProgress;
  const trendAtToday = trendAtCalendarYear + annualSlope * yearProgress;

  if (yearNum === calendarYear) {
    return trendAtToday;
  }

  return trendAtToday + annualSlope * (yearNum - todayPosition);
}

/** Project Paris Agreement path from today's position on the exponential decay curve. */
export function adjustCarbonLawFromToday(
  yearNum: number,
  calendarYear: number,
  yearProgress: number,
  carbonLawBaseYear: number,
  carbonLawBaseValue: number,
): number | undefined {
  if (yearNum < calendarYear || carbonLawBaseValue <= 0) {
    return undefined;
  }

  if (yearProgress <= 0 || yearProgress >= 1) {
    return (
      calculateParisValue(
        yearNum,
        carbonLawBaseYear,
        carbonLawBaseValue,
        CARBON_LAW_REDUCTION_RATE,
      ) ?? undefined
    );
  }

  const todayPosition = calendarYear + yearProgress;
  const parisAtToday = calculateParisValue(
    todayPosition,
    carbonLawBaseYear,
    carbonLawBaseValue,
    CARBON_LAW_REDUCTION_RATE,
  );

  if (parisAtToday == null) {
    return undefined;
  }

  if (yearNum === calendarYear) {
    return parisAtToday;
  }

  const projected =
    parisAtToday *
    Math.pow(1 - CARBON_LAW_REDUCTION_RATE, yearNum - todayPosition);

  return projected > 0 ? projected : undefined;
}

/** During a partial current year, projection lines begin at today — not Jan 1. */
export function isBeforeTodayOnChart(
  yearNum: number,
  calendarYear: number,
  yearProgress: number,
): boolean {
  if (yearProgress <= 0 || yearProgress >= 1) {
    return false;
  }

  return yearNum < calendarYear;
}

export function getYearToDateContext(now: Date = new Date()) {
  return {
    calendarYear: now.getFullYear(),
    yearProgress: getYearProgress(now),
    todayPosition: now.getFullYear() + getYearProgress(now),
  };
}
