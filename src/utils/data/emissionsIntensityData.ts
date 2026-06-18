import type {
  ReportingPeriod,
  ReportingPeriodFromList,
  AIGeneratable,
} from "@/types/company";
import type {
  EmissionsIntensityDataPoint,
  EmissionsIntensitySummary,
} from "@/types/emissionsIntensity";

export const INTENSITY_PER_MILLION = 1_000_000;
export const MIN_INTENSITY_DATA_POINTS = 2;

export function calculateEmissionsIntensity(
  totalEmissions: number,
  turnover: number,
): number {
  return (totalEmissions / turnover) * INTENSITY_PER_MILLION;
}

export function countIntensityDataPoints(
  periods: ReportingPeriod[] | undefined,
): number {
  if (!periods?.length) return 0;

  return periods.filter((period) => {
    const total = period.emissions?.calculatedTotalEmissions;
    const turnover = period.economy?.turnover?.value;
    return total != null && total > 0 && turnover != null && turnover > 0;
  }).length;
}

export function hasEnoughIntensityData(
  periods: ReportingPeriod[] | undefined,
): boolean {
  return countIntensityDataPoints(periods) >= MIN_INTENSITY_DATA_POINTS;
}

export function getEmissionsIntensityData(
  periods: ReportingPeriod[],
  isAIGenerated: (data: AIGeneratable | undefined | null) => boolean,
  isEmissionsAIGenerated: (
    period: ReportingPeriod | ReportingPeriodFromList,
  ) => boolean,
): EmissionsIntensityDataPoint[] {
  if (!periods?.length) return [];

  const sortedPeriods = [...periods].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  const rawPoints = sortedPeriods
    .map((period) => {
      const year = new Date(period.endDate).getFullYear();
      const total = period.emissions?.calculatedTotalEmissions;
      const turnover = period.economy?.turnover;

      if (
        total == null ||
        total <= 0 ||
        turnover?.value == null ||
        turnover.value <= 0
      ) {
        return null;
      }

      return {
        year,
        total,
        turnover: turnover.value,
        turnoverCurrency: turnover.currency ?? undefined,
        intensity: calculateEmissionsIntensity(total, turnover.value),
        emissionsIsAIGenerated: isEmissionsAIGenerated(period),
        turnoverIsAIGenerated: isAIGenerated(turnover),
      };
    })
    .filter((point): point is EmissionsIntensityDataPoint => point != null);

  if (rawPoints.length === 0) return [];

  const firstPoint = rawPoints[0];
  const firstIntensity = firstPoint.intensity!;
  const firstTotal = firstPoint.total!;
  const firstTurnover = firstPoint.turnover!;

  return rawPoints.map((point, index) => {
    const previousPoint = index > 0 ? rawPoints[index - 1] : undefined;
    const intensityChangeFromPreviousYear = previousPoint?.intensity
      ? ((point.intensity! - previousPoint.intensity) /
          previousPoint.intensity) *
        100
      : undefined;

    return {
      ...point,
      emissionsIndex: (point.total! / firstTotal) * 100,
      turnoverIndex: (point.turnover! / firstTurnover) * 100,
      intensityChangeFromFirstYear:
        ((point.intensity! - firstIntensity) / firstIntensity) * 100,
      intensityChangeFromPreviousYear,
    };
  });
}

export function getEmissionsIntensitySummary(
  data: EmissionsIntensityDataPoint[],
): EmissionsIntensitySummary | null {
  if (data.length === 0) return null;

  const first = data[0];
  const latest = data[data.length - 1];

  if (first.intensity == null || latest.intensity == null) {
    return null;
  }

  const changeFromFirstYearPercent =
    ((latest.intensity - first.intensity) / first.intensity) * 100;

  let trend: EmissionsIntensitySummary["trend"] = "stable";
  if (changeFromFirstYearPercent <= -5) {
    trend = "improving";
  } else if (changeFromFirstYearPercent >= 5) {
    trend = "worsening";
  }

  return {
    firstYear: first.year,
    latestYear: latest.year,
    latestIntensity: latest.intensity,
    firstIntensity: first.intensity,
    changeFromFirstYearPercent,
    trend,
    turnoverCurrency: latest.turnoverCurrency,
  };
}
