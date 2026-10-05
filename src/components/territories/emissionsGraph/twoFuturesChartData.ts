import type { DataPoint } from "@/types/emissions";

export type TwoFuturesRow = {
  year: number;
  /** Reported history, or the latest estimate for the current year. */
  history?: number;
  /** Projected path if nothing changes — from the current year onward. */
  trend?: number;
  /** Paris-compatible path — from the current year onward. */
  paris?: number;
  /** Bottom of the overshoot band (stacked on paris). */
  parisBase?: number;
  /** Trend minus Paris, for the shaded wedge. */
  gap?: number;
};

export function buildTwoFuturesRows(
  data: DataPoint[],
  currentYear: number,
): TwoFuturesRow[] {
  const lastReportedYear = data.reduce((max, point) => {
    if (point.total == null) return max;
    return Math.max(max, point.year);
  }, 0);

  return [...data]
    .sort((a, b) => a.year - b.year)
    .map((point) => {
      const isNowOrPast = point.year <= currentYear;

      let history: number | undefined;
      if (isNowOrPast) {
        if (point.year <= lastReportedYear) {
          history = point.total ?? undefined;
        } else {
          history = point.approximated ?? undefined;
        }
      }

      const trend =
        point.year >= currentYear ? (point.trend ?? undefined) : undefined;
      const paris =
        point.year >= currentYear ? (point.carbonLaw ?? undefined) : undefined;

      const gap =
        point.year >= currentYear && trend !== undefined && paris !== undefined
          ? Math.max(0, trend - paris)
          : undefined;

      const parisBase =
        point.year >= currentYear && paris !== undefined ? paris : undefined;

      return {
        year: point.year,
        history,
        trend,
        paris,
        parisBase,
        gap,
      };
    });
}

export type FutureTotalsComparison = {
  totalParis: number;
  totalTrend: number;
  /**
   * (trend total − Paris total) / Paris total.
   * Positive is overshoot, negative is undershoot.
   */
  gapShareOfParis: number | null;
  /**
   * (trend total − Paris total) / trend total.
   * Positive is overshoot, negative is undershoot.
   */
  gapShareOfTrend: number | null;
};

/**
 * Compare the summed Paris path and the summed trend path from today
 * through endYear. The gap is a share of each total, not absolute tonnes.
 */
export function compareFuturePathTotals(
  data: DataPoint[],
  currentYear: number,
  endYear: number,
): FutureTotalsComparison {
  let totalParis = 0;
  let totalTrend = 0;
  let counted = 0;

  for (const point of data) {
    if (point.year < currentYear || point.year > endYear) continue;
    if (point.trend == null || point.carbonLaw == null) continue;
    totalParis += point.carbonLaw;
    totalTrend += point.trend;
    counted += 1;
  }

  if (counted === 0) {
    return {
      totalParis: 0,
      totalTrend: 0,
      gapShareOfParis: null,
      gapShareOfTrend: null,
    };
  }

  const gap = totalTrend - totalParis;

  return {
    totalParis,
    totalTrend,
    gapShareOfParis: totalParis > 0 ? gap / totalParis : null,
    gapShareOfTrend: totalTrend > 0 ? gap / totalTrend : null,
  };
}
