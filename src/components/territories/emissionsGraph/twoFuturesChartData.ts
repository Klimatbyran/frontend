import type { DataPoint } from "@/types/emissions";

export type TwoFuturesRow = {
  year: number;
  /** Reported history. Missing years stay empty so the solid line breaks. */
  history?: number;
  /**
   * Dashed past path: modelled years up to today, years skipped between
   * reported points, and the reported endpoints that join those segments.
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
    estimated: rows.some((row) => row.historyIsEstimated),
  };
}

type PastPathPoint = {
  year: number;
  value: number;
  reported: boolean;
};

function pastPathPoints(
  data: DataPoint[],
  currentYear: number,
): PastPathPoint[] {
  const byYear = new Map<number, PastPathPoint>();

  for (const point of data) {
    if (point.year > currentYear || point.total == null) continue;
    byYear.set(point.year, {
      year: point.year,
      value: point.total,
      reported: true,
    });
  }

  const lastReportedYear = [...byYear.keys()].reduce(
    (max, year) => Math.max(max, year),
    0,
  );

  for (const point of data) {
    if (
      point.year > currentYear ||
      point.year <= lastReportedYear ||
      point.approximated == null ||
      byYear.has(point.year)
    ) {
      continue;
    }
    byYear.set(point.year, {
      year: point.year,
      value: point.approximated,
      reported: false,
    });
  }

  return [...byYear.values()].sort((a, b) => a.year - b.year);
}

/**
 * Years skipped between past-path points get a dashed value. A modelled
 * value wins; otherwise the line is a straight bridge between the endpoints.
 */
function gapEstimates(
  pastPoints: PastPathPoint[],
  approximatedByYear: Map<number, number>,
): { filled: Map<number, number>; anchors: Set<number> } {
  const filled = new Map<number, number>();
  const anchors = new Set<number>();

  for (let i = 0; i < pastPoints.length - 1; i++) {
    const left = pastPoints[i];
    const right = pastPoints[i + 1];
    const span = right.year - left.year;
    const bridgesGap = span > 1 || !right.reported;
    if (!bridgesGap) continue;

    if (left.reported) anchors.add(left.year);
    if (right.reported) anchors.add(right.year);

    for (let year = left.year + 1; year < right.year; year++) {
      const modelled = approximatedByYear.get(year);
      const t = (year - left.year) / span;
      filled.set(year, modelled ?? left.value + (right.value - left.value) * t);
    }
  }

  return { filled, anchors };
}

export function buildTwoFuturesRows(
  data: DataPoint[],
  currentYear: number,
): TwoFuturesRow[] {
  const pastPoints = pastPathPoints(data, currentYear);
  const pastByYear = new Map(pastPoints.map((point) => [point.year, point]));
  const approximatedByYear = new Map<number, number>();
  const pointByYear = new Map<number, DataPoint>();

  for (const point of data) {
    pointByYear.set(point.year, point);
    if (point.approximated != null) {
      approximatedByYear.set(point.year, point.approximated);
    }
  }

  const { filled, anchors } = gapEstimates(pastPoints, approximatedByYear);
  const years = new Set<number>([...pointByYear.keys(), ...filled.keys()]);

  return [...years]
    .sort((a, b) => a - b)
    .map((year) => {
      const point = pointByYear.get(year);
      const past = pastByYear.get(year);
      const isReported = past?.reported === true;
      const filledValue = filled.get(year);

      let historyEstimated: number | undefined;
      let historyIsEstimated = false;
      if (filledValue != null) {
        historyEstimated = filledValue;
        historyIsEstimated = true;
      } else if (past && !past.reported) {
        historyEstimated = past.value;
        historyIsEstimated = true;
      } else if (isReported && anchors.has(year)) {
        historyEstimated = past.value;
      }

      const trend =
        year >= currentYear ? (point?.trend ?? undefined) : undefined;
      const paris =
        year >= currentYear ? (point?.carbonLaw ?? undefined) : undefined;
      const gap =
        year >= currentYear && trend !== undefined && paris !== undefined
          ? Math.max(0, trend - paris)
          : undefined;
      const parisBase =
        year >= currentYear && paris !== undefined ? paris : undefined;

      return {
        year,
        history: isReported ? past.value : undefined,
        historyEstimated,
        trend,
        paris,
        parisBase,
        gap,
        historyIsAIGenerated: isReported && point?.isAIGenerated === true,
        historyIsEstimated,
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
