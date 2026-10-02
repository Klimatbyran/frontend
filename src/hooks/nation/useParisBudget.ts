import { useMemo } from "react";
import { useNationDetails } from "@/hooks/nation/useNationDetails";
import { calculateCarbonLawCumulativeEmissions } from "@/lib/calculations/trends/meetsParis";
import type { EmissionDataPoint } from "@/types/municipality";

export const CARBON_LAW_RATE_PERCENT = 11.72;
const END_YEAR = 2050;
const TONNES_PER_MTON = 1_000_000;

export type BudgetPathPoint = {
  year: number;
  trendMton: number;
  parisMton: number;
};

export type ParisBudgetFacts = {
  startYear: number;
  endYear: number;
  budgetMton: number;
  trendMton: number;
  overshootRatio: number;
  budgetSpentYear: number | null;
  trendRatePercent: number;
  onTrack: boolean;
  path: BudgetPathPoint[];
  history: { year: number; mton: number }[];
};

function toPoints(series: (EmissionDataPoint | null)[]) {
  return series
    .filter((point): point is EmissionDataPoint => point != null)
    .map((point) => ({ year: Number(point.year), value: point.value }))
    .filter((point) => !Number.isNaN(point.year))
    .sort((a, b) => a.year - b.year);
}

export function buildParisBudgetFacts(
  trend: { year: number; value: number }[],
  history: { year: number; value: number }[],
): ParisBudgetFacts | null {
  const start = trend[0];
  if (!start || start.value <= 0) return null;

  const budgetTonnes = calculateCarbonLawCumulativeEmissions(
    start.value,
    start.year,
    END_YEAR,
  );

  let cumulativeTonnes = 0;
  let budgetSpentYear: number | null = null;
  const path: BudgetPathPoint[] = [];
  let parisTonnes = start.value;

  const trendByYear = new Map(trend.map((point) => [point.year, point.value]));
  let lastTrendTonnes = start.value;

  for (let year = start.year; year <= END_YEAR; year++) {
    const trendValue = Math.max(0, trendByYear.get(year) ?? lastTrendTonnes);
    lastTrendTonnes = trendValue;

    cumulativeTonnes += trendValue;
    if (budgetSpentYear === null && cumulativeTonnes >= budgetTonnes) {
      budgetSpentYear = year;
    }

    path.push({
      year,
      trendMton: trendValue / TONNES_PER_MTON,
      parisMton: parisTonnes / TONNES_PER_MTON,
    });
    parisTonnes *= 1 - CARBON_LAW_RATE_PERCENT / 100;
  }

  const last = path.at(-1)!;
  const years = last.year - start.year;
  const startMton = start.value / TONNES_PER_MTON;
  const trendRatePercent =
    years > 0 && last.trendMton > 0
      ? (1 - (last.trendMton / startMton) ** (1 / years)) * 100
      : 0;

  const trendMton = cumulativeTonnes / TONNES_PER_MTON;
  const budgetMton = budgetTonnes / TONNES_PER_MTON;

  return {
    startYear: start.year,
    endYear: END_YEAR,
    budgetMton,
    trendMton,
    overshootRatio: budgetMton > 0 ? trendMton / budgetMton : 0,
    budgetSpentYear,
    trendRatePercent,
    onTrack: cumulativeTonnes <= budgetTonnes,
    path,
    history: history.map((point) => ({
      year: point.year,
      mton: point.value / TONNES_PER_MTON,
    })),
  };
}

export function useParisBudget() {
  const { nation, loading, error } = useNationDetails();

  const facts = useMemo(() => {
    if (!nation) return null;
    const trend = toPoints(nation.trend);
    const history = toPoints(nation.emissions);
    if (trend.length === 0 || history.length === 0) return null;
    return buildParisBudgetFacts(trend, history);
  }, [nation]);

  return { facts, loading, error };
}
