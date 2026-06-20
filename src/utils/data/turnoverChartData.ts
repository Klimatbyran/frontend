import type { ChartData } from "@/types/emissions";
import type { ReportingPeriod } from "@/types/company";
import { filterValidTotalData } from "@/components/charts/historicEmissions/utils/chartData";

export const MIN_TURNOVER_DATA_POINTS = 2;

export function countTurnoverDataPoints(
  periods: ReportingPeriod[] | undefined,
): number {
  if (!periods?.length) return 0;
  return periods.filter((period) => period.economy?.turnover?.value != null)
    .length;
}

export function countCompleteTurnoverEmissionsDataPoints(
  periods: ReportingPeriod[] | undefined,
): number {
  if (!periods?.length) return 0;

  return periods.filter((period) => {
    const total = period.emissions?.calculatedTotalEmissions;
    const turnover = period.economy?.turnover?.value;
    return total != null && total > 0 && turnover != null && turnover > 0;
  }).length;
}

export function hasEnoughTurnoverData(
  periods: ReportingPeriod[] | undefined,
): boolean {
  return (
    countCompleteTurnoverEmissionsDataPoints(periods) >=
    MIN_TURNOVER_DATA_POINTS
  );
}

export function filterValidTurnoverData(data: ChartData[]): ChartData[] {
  return data.filter(
    (point) => point.turnover != null && Number(point.turnover) > 0,
  );
}

export function filterCompleteTurnoverEmissionsData(
  data: ChartData[],
): ChartData[] {
  const emissionsData = filterValidTotalData(data);
  const turnoverByYear = new Map(
    filterValidTurnoverData(data).map((point) => [point.year, point]),
  );

  return emissionsData
    .filter((point) => turnoverByYear.has(point.year))
    .map((point) => {
      const turnoverPoint = turnoverByYear.get(point.year)!;

      return {
        year: point.year,
        total: point.total,
        isAIGenerated: point.isAIGenerated,
        turnover: turnoverPoint.turnover,
        turnoverCurrency: turnoverPoint.turnoverCurrency,
        turnoverIsAIGenerated: turnoverPoint.turnoverIsAIGenerated,
      };
    });
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
