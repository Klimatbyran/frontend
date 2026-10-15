import type { DataPoint } from "@/types/emissions";

export type TwoFuturesRow = {
  year: number;
  /** Reported history up to the latest year with a measured total. */
  history?: number;
  /**
   * Modelled years on the past path, plus the last reported year so the
   * dashed segment stays connected to the solid line.
   */
  historyEstimated?: number;
  /** Projected path if nothing changes — from the current year onward. */
  trend?: number;
  /** Paris-compatible path — from the current year onward. */
  paris?: number;
  /** Bottom of the overshoot band (stacked on paris). */
  parisBase?: number;
  /** Trend minus Paris, for the shaded wedge. */
  gap?: number;
  /** Reported total for this year was AI-extracted. */
  historyIsAIGenerated?: boolean;
  /** History value for this year comes from the modelled estimate. */
  historyIsEstimated?: boolean;
};

export function historyMarkerFlags(rows: TwoFuturesRow[]) {
  return {
    ai: rows.some((row) => row.historyIsAIGenerated),
    estimated: rows.some((row) => row.historyIsEstimated),
  };
}

export function buildTwoFuturesRows(
  data: DataPoint[],
  currentYear: number,
): TwoFuturesRow[] {
  const lastReportedYear = data.reduce((max, point) => {
    if (point.total == null) return max;
    return Math.max(max, point.year);
  }, 0);

  const hasEstimateAfterLastReport = data.some(
    (point) =>
      point.year > lastReportedYear &&
      point.year <= currentYear &&
      point.approximated != null,
  );

  return [...data]
    .sort((a, b) => a.year - b.year)
    .map((point) => {
      const isNowOrPast = point.year <= currentYear;
      const isReported =
        isNowOrPast && point.year <= lastReportedYear && point.total != null;
      const isEstimated =
        isNowOrPast &&
        point.year > lastReportedYear &&
        point.approximated != null;

      const history = isReported ? (point.total ?? undefined) : undefined;
      let historyEstimated: number | undefined;
      if (hasEstimateAfterLastReport) {
        if (isEstimated) {
          historyEstimated = point.approximated ?? undefined;
        } else if (point.year === lastReportedYear && point.total != null) {
          historyEstimated = point.total;
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
        historyEstimated,
        trend,
        paris,
        parisBase,
        gap,
        historyIsAIGenerated: isReported && point.isAIGenerated === true,
        historyIsEstimated: isEstimated,
      };
    });
}

export type FutureTotalsComparison = {
  totalParis: number;
  totalTrend: number;
  /** Trend emissions in endYear. */
  endTrend: number;
  /** Paris-path emissions in endYear. */
  endParis: number;
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
 * Compare the Paris path and the trend path from today through endYear.
 * Totals are summed yearly emissions. endTrend and endParis are the values
 * in endYear — the level the chart reaches, not the sum along the way.
 */
export function compareFuturePathTotals(
  data: DataPoint[],
  currentYear: number,
  endYear: number,
): FutureTotalsComparison {
  let totalParis = 0;
  let totalTrend = 0;
  let counted = 0;
  let endTrend = 0;
  let endParis = 0;

  for (const point of data) {
    if (point.year < currentYear || point.year > endYear) continue;
    if (point.trend == null || point.carbonLaw == null) continue;
    totalParis += point.carbonLaw;
    totalTrend += point.trend;
    counted += 1;
    if (point.year === endYear) {
      endTrend = point.trend;
      endParis = point.carbonLaw;
    }
  }

  if (counted === 0) {
    return {
      totalParis: 0,
      totalTrend: 0,
      endTrend: 0,
      endParis: 0,
      gapShareOfParis: null,
      gapShareOfTrend: null,
    };
  }

  const gap = totalTrend - totalParis;

  return {
    totalParis,
    totalTrend,
    endTrend,
    endParis,
    gapShareOfParis: totalParis > 0 ? gap / totalParis : null,
    gapShareOfTrend: totalTrend > 0 ? gap / totalTrend : null,
  };
}
