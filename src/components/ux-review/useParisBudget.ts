import { useMemo } from "react";
import { useNationDetails } from "@/hooks/nation/useNationDetails";
import { calculateCarbonLawCumulativeEmissions } from "@/lib/calculations/trends/meetsParis";
import type { EmissionDataPoint } from "@/types/municipality";

export const CARBON_LAW_RATE_PERCENT = 11.72;
const END_YEAR = 2050;
const TONNES_PER_MTON = 1_000_000;

export type BudgetPathPoint = {
  year: number;
  /** Where today's trajectory takes us, Mt CO₂e. */
  trendMton: number;
  /** The Carbon Law path from the same starting point, Mt CO₂e. */
  parisMton: number;
};

export type ParisBudgetFacts = {
  startYear: number;
  endYear: number;
  /** Everything Sweden may still emit and stay inside 1.5°C, Mt CO₂e. */
  budgetMton: number;
  /** What today's trajectory adds up to over the same years, Mt CO₂e. */
  trendMton: number;
  /** trendMton / budgetMton — how many budgets the current path spends. */
  overshootRatio: number;
  /** The year the trend has spent the whole budget, or null if it never does. */
  budgetSpentYear: number | null;
  /** Annual reduction implied by the trend, as a positive percentage. */
  trendRatePercent: number;
  /** History plus both futures, for charting. */
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

function buildFacts(
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
  const trendRatePercent =
    years > 0 && last.trendMton > 0
      ? (1 -
          (last.trendMton / (start.value / TONNES_PER_MTON)) ** (1 / years)) *
        100
      : 0;

  return {
    startYear: start.year,
    endYear: END_YEAR,
    budgetMton: budgetTonnes / TONNES_PER_MTON,
    trendMton: cumulativeTonnes / TONNES_PER_MTON,
    overshootRatio: budgetTonnes > 0 ? cumulativeTonnes / budgetTonnes : 0,
    budgetSpentYear,
    trendRatePercent,
    path,
    history: history.map((point) => ({
      year: point.year,
      mton: point.value / TONNES_PER_MTON,
    })),
  };
}

/**
 * Sweden's remaining 1.5°C budget versus where the current trajectory lands.
 *
 * Both numbers already exist in the product (the Carbon Law cumulative total
 * behind every "meets Paris" yes/no) but are never shown to readers. This hook
 * surfaces them so a mockup can lead with the answer.
 */
export function useParisBudget() {
  const { nation, loading, error } = useNationDetails();

  const facts = useMemo(() => {
    if (!nation) return null;
    const trend = toPoints(nation.trend);
    const history = toPoints(nation.emissions);
    if (trend.length === 0 || history.length === 0) return null;
    return buildFacts(trend, history);
  }, [nation]);

  return { facts, loading, error };
}
