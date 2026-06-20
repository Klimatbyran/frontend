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

export const DECOUPLING_CHANGE_THRESHOLD = 5;
export const INTENSITY_PER_MILLION = 1_000_000;

export type DecouplingVerdict = "yes" | "no-red" | "no-yellow";

export interface DecouplingComparison {
  startYear: number;
  endYear: number;
  turnoverChangePercent: number;
  emissionsChangePercent: number;
  startIntensity: number;
  endIntensity: number;
  verdict: DecouplingVerdict;
  usedBaseYear: boolean;
}

export function calculateEmissionsIntensity(
  totalEmissions: number,
  turnover: number,
): number {
  return (totalEmissions / turnover) * INTENSITY_PER_MILLION;
}

export function getDecouplingVerdict(
  turnoverChangePercent: number,
  emissionsChangePercent: number,
  threshold = DECOUPLING_CHANGE_THRESHOLD,
): DecouplingVerdict {
  const turnoverUp = turnoverChangePercent > threshold;
  const turnoverDown = turnoverChangePercent < -threshold;
  const emissionsUp = emissionsChangePercent > threshold;
  const emissionsDown = emissionsChangePercent < -threshold;
  const turnoverStable = !turnoverUp && !turnoverDown;
  const emissionsStable = !emissionsUp && !emissionsDown;

  if (turnoverUp && emissionsDown) {
    return "yes";
  }

  if (turnoverDown && emissionsUp) {
    return "no-red";
  }

  if (turnoverStable && emissionsStable) {
    return "no-yellow";
  }

  if (turnoverUp && emissionsUp) {
    return "no-red";
  }

  return "no-yellow";
}

export function getDecouplingComparison(
  data: ChartData[],
  baseYear?: number,
): DecouplingComparison | null {
  const completeData = filterCompleteTurnoverEmissionsData(data);
  if (completeData.length < 2) return null;

  const end = completeData[completeData.length - 1];
  let start = completeData[0];
  let usedBaseYear = false;

  if (baseYear != null) {
    const baseYearPoint = completeData.find((point) => point.year === baseYear);
    if (baseYearPoint && baseYearPoint.year !== end.year) {
      start = baseYearPoint;
      usedBaseYear = true;
    }
  }

  if (start.year === end.year) return null;

  const startTotal = start.total!;
  const startTurnover = start.turnover!;
  const endTotal = end.total!;
  const endTurnover = end.turnover!;

  const turnoverChangePercent =
    ((endTurnover - startTurnover) / startTurnover) * 100;
  const emissionsChangePercent = ((endTotal - startTotal) / startTotal) * 100;

  return {
    startYear: start.year,
    endYear: end.year,
    turnoverChangePercent,
    emissionsChangePercent,
    startIntensity: calculateEmissionsIntensity(startTotal, startTurnover),
    endIntensity: calculateEmissionsIntensity(endTotal, endTurnover),
    verdict: getDecouplingVerdict(
      turnoverChangePercent,
      emissionsChangePercent,
    ),
    usedBaseYear,
  };
}
