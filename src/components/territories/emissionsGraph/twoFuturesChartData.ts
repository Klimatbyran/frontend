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
   * Area under the piecewise-linear Paris path. This is the shape drawn
   * on the chart, which is what “how many times” is read against.
   */
  areaParis: number;
  /** Area under the piecewise-linear trend path. */
  areaTrend: number;
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

function areaUnderPath(points: { year: number; value: number }[]): number {
  if (points.length === 0) return 0;
  if (points.length === 1) return points[0].value;

  let area = 0;
  for (let i = 1; i < points.length; i++) {
    const years = points[i].year - points[i - 1].year;
    if (years <= 0) continue;
    area += ((points[i - 1].value + points[i].value) / 2) * years;
  }
  return area;
}

/**
 * Compare the Paris path and the trend path from today through endYear.
 * Totals are summed yearly emissions. Areas follow the straight lines drawn
 * between those years — the comparison the chart actually shows.
 */
export function compareFuturePathTotals(
  data: DataPoint[],
  currentYear: number,
  endYear: number,
): FutureTotalsComparison {
  let totalParis = 0;
  let totalTrend = 0;
  const parisPoints: { year: number; value: number }[] = [];
  const trendPoints: { year: number; value: number }[] = [];

  for (const point of data) {
    if (point.year < currentYear || point.year > endYear) continue;
    if (point.trend == null || point.carbonLaw == null) continue;
    totalParis += point.carbonLaw;
    totalTrend += point.trend;
    parisPoints.push({ year: point.year, value: point.carbonLaw });
    trendPoints.push({ year: point.year, value: point.trend });
  }

  if (parisPoints.length === 0) {
    return {
      totalParis: 0,
      totalTrend: 0,
      areaParis: 0,
      areaTrend: 0,
      gapShareOfParis: null,
      gapShareOfTrend: null,
    };
  }

  const byYear = (points: { year: number; value: number }[]) =>
    [...points]
      .sort((a, b) => a.year - b.year)
      .reduce<{ year: number; value: number }[]>((merged, point) => {
        const last = merged[merged.length - 1];
        if (last && last.year === point.year) {
          last.value += point.value;
        } else {
          merged.push({ ...point });
        }
        return merged;
      }, []);

  const areaParis = areaUnderPath(byYear(parisPoints));
  const areaTrend = areaUnderPath(byYear(trendPoints));

  const gap = totalTrend - totalParis;

  return {
    totalParis,
    totalTrend,
    areaParis,
    areaTrend,
    gapShareOfParis: totalParis > 0 ? gap / totalParis : null,
    gapShareOfTrend: totalTrend > 0 ? gap / totalTrend : null,
  };
}
