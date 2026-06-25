import type { ChartData } from "@/types/emissions";
import { filterValidTotalData } from "@/components/charts/historicEmissions/utils/chartData";

export const MIN_COMPLETE_DATA_POINTS = 2;
export const INTENSITY_STABLE_THRESHOLD = 3;

const INTENSITY_PER_MILLION = 1_000_000;

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

export interface TurnoverEmissionsSection {
  displayData: ChartData[];
  comparison: DecouplingComparison;
}

export interface BaseYearChartSettings {
  showBaseYear: boolean;
  baseYear?: number;
  isFirstYear: boolean;
}

function hasPositiveTurnover(point: ChartData): boolean {
  return point.turnover != null && Number(point.turnover) > 0;
}

function getCompleteData(data: ChartData[]): ChartData[] {
  const turnoverByYear = new Map(
    data.filter(hasPositiveTurnover).map((point) => [point.year, point]),
  );

  return filterValidTotalData(data)
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

function hasCompleteDataAtYear(data: ChartData[], year: number): boolean {
  return getCompleteData(data).some((point) => point.year === year);
}

/** Years with both emissions and turnover, optionally from base year onward. */
export function getDisplayData(
  data: ChartData[],
  baseYear?: number,
): ChartData[] {
  const completeData = getCompleteData(data);
  if (baseYear == null || !hasCompleteDataAtYear(data, baseYear)) {
    return completeData;
  }

  return completeData.filter((point) => point.year >= baseYear);
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

function calculateEmissionsIntensity(
  totalEmissions: number,
  turnover: number,
): number {
  return (totalEmissions / turnover) * INTENSITY_PER_MILLION;
}

function calculateIntensityChangePercent(
  startIntensity: number,
  endIntensity: number,
): number {
  if (startIntensity === 0) return 0;
  return ((endIntensity - startIntensity) / startIntensity) * 100;
}

function calculatePercentChange(start: number, end: number): number {
  return ((end - start) / start) * 100;
}

export function buildDecouplingComparison(
  displayData: ChartData[],
  baseYear?: number,
): DecouplingComparison | null {
  if (displayData.length < MIN_COMPLETE_DATA_POINTS) return null;

  const start = displayData[0];
  const end = displayData[displayData.length - 1];
  if (start.year === end.year) return null;

  const startTotal = start.total!;
  const startTurnover = start.turnover!;
  const endTotal = end.total!;
  const endTurnover = end.turnover!;

  const startIntensity = calculateEmissionsIntensity(startTotal, startTurnover);
  const endIntensity = calculateEmissionsIntensity(endTotal, endTurnover);
  const intensityChangePercent = calculateIntensityChangePercent(
    startIntensity,
    endIntensity,
  );

  return {
    startYear: start.year,
    endYear: end.year,
    turnoverChangePercent: calculatePercentChange(startTurnover, endTurnover),
    emissionsChangePercent: calculatePercentChange(startTotal, endTotal),
    startIntensity,
    endIntensity,
    intensityChangePercent,
    verdict: getDecouplingVerdict(intensityChangePercent),
    usedBaseYear:
      baseYear != null &&
      displayData.length > 0 &&
      displayData[0].year === baseYear,
  };
}

/** Chart data and intensity comparison for the turnover/emissions section. */
export function getTurnoverEmissionsSection(
  data: ChartData[],
  baseYear?: number,
): TurnoverEmissionsSection | null {
  const displayData = getDisplayData(data, baseYear);
  const comparison = buildDecouplingComparison(displayData, baseYear);

  if (!comparison) return null;

  return { displayData, comparison };
}

export function getBaseYearChartSettings(
  displayData: ChartData[],
  baseYear?: number,
): BaseYearChartSettings {
  const showBaseYear =
    baseYear != null && displayData.some((point) => point.year === baseYear);

  return {
    showBaseYear,
    baseYear: showBaseYear ? baseYear : undefined,
    isFirstYear: showBaseYear && baseYear === displayData[0]?.year,
  };
}
