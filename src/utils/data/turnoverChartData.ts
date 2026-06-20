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

export function hasCompleteTurnoverEmissionsAtYear(
  data: ChartData[],
  year: number,
): boolean {
  return filterCompleteTurnoverEmissionsData(data).some(
    (point) => point.year === year,
  );
}

export function filterCompleteTurnoverEmissionsDataFromBaseYear(
  data: ChartData[],
  baseYear?: number,
): ChartData[] {
  const completeData = filterCompleteTurnoverEmissionsData(data);
  if (baseYear == null) return completeData;

  if (!hasCompleteTurnoverEmissionsAtYear(data, baseYear)) {
    return completeData;
  }

  return completeData.filter((point) => point.year >= baseYear);
}

export function hasEnoughChartDisplayData(
  data: ChartData[],
  baseYear?: number,
): boolean {
  return (
    filterCompleteTurnoverEmissionsDataFromBaseYear(data, baseYear).length >=
    MIN_TURNOVER_DATA_POINTS
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

export const INTENSITY_STABLE_THRESHOLD = 3;
export const INTENSITY_PER_MILLION = 1_000_000;

export type DecouplingVerdict = "yes" | "no-red" | "no-yellow";

export interface DecouplingComparison {
  startYear: number;
  endYear: number;
  turnoverChangePercent: number;
  emissionsChangePercent: number;
  startIntensity: number;
  endIntensity: number;
  intensityChangePercent: number;
  verdict: DecouplingVerdict;
  usedBaseYear: boolean;
}

export function calculateEmissionsIntensity(
  totalEmissions: number,
  turnover: number,
): number {
  return (totalEmissions / turnover) * INTENSITY_PER_MILLION;
}

export function calculateIntensityChangePercent(
  startIntensity: number,
  endIntensity: number,
): number {
  if (startIntensity === 0) return 0;
  return ((endIntensity - startIntensity) / startIntensity) * 100;
}

export function getDecouplingVerdict(
  intensityChangePercent: number,
  threshold = INTENSITY_STABLE_THRESHOLD,
): DecouplingVerdict {
  if (intensityChangePercent < -threshold) {
    return "yes";
  }

  if (intensityChangePercent > threshold) {
    return "no-red";
  }

  return "no-yellow";
}

export function getDecouplingComparison(
  data: ChartData[],
  baseYear?: number,
): DecouplingComparison | null {
  const completeData = filterCompleteTurnoverEmissionsDataFromBaseYear(
    data,
    baseYear,
  );
  if (completeData.length < 2) return null;

  const start = completeData[0];
  const end = completeData[completeData.length - 1];
  const usedBaseYear =
    baseYear != null &&
    completeData.length > 0 &&
    completeData[0].year === baseYear;

  if (start.year === end.year) return null;

  const startTotal = start.total!;
  const startTurnover = start.turnover!;
  const endTotal = end.total!;
  const endTurnover = end.turnover!;

  const turnoverChangePercent =
    ((endTurnover - startTurnover) / startTurnover) * 100;
  const emissionsChangePercent = ((endTotal - startTotal) / startTotal) * 100;
  const startIntensity = calculateEmissionsIntensity(startTotal, startTurnover);
  const endIntensity = calculateEmissionsIntensity(endTotal, endTurnover);
  const intensityChangePercent = calculateIntensityChangePercent(
    startIntensity,
    endIntensity,
  );

  return {
    startYear: start.year,
    endYear: end.year,
    turnoverChangePercent,
    emissionsChangePercent,
    startIntensity,
    endIntensity,
    intensityChangePercent,
    verdict: getDecouplingVerdict(intensityChangePercent),
    usedBaseYear,
  };
}
