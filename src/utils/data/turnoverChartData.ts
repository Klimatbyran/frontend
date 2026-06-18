import type { ChartData } from "@/types/emissions";
import type { ReportingPeriod } from "@/types/company";

export const MIN_TURNOVER_DATA_POINTS = 2;

export function countTurnoverDataPoints(
  periods: ReportingPeriod[] | undefined,
): number {
  if (!periods?.length) return 0;
  return periods.filter((period) => period.economy?.turnover?.value != null)
    .length;
}

export function hasEnoughTurnoverData(
  periods: ReportingPeriod[] | undefined,
): boolean {
  return countTurnoverDataPoints(periods) >= MIN_TURNOVER_DATA_POINTS;
}

export function filterValidTurnoverData(data: ChartData[]): ChartData[] {
  return data.filter(
    (point) => point.turnover != null && Number(point.turnover) > 0,
  );
}

export function getLastTurnoverYear(
  data: ChartData[],
  fallback: number,
): number {
  return (
    data.filter((point) => point.turnover != null).slice(-1)[0]?.year ??
    fallback
  );
}
