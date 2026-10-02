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
  return [...data]
    .sort((a, b) => a.year - b.year)
    .map((point) => {
      const isNowOrPast = point.year <= currentYear;

      let history: number | undefined;
      if (isNowOrPast) {
        history = point.total ?? point.approximated;
      }

      const trend =
        point.year >= currentYear ? point.trend ?? undefined : undefined;
      const paris =
        point.year >= currentYear ? point.carbonLaw ?? undefined : undefined;

      const gap =
        point.year >= currentYear &&
        trend !== undefined &&
        paris !== undefined
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

/** Sum of (trend − Paris) for each future year — a readable overshoot proxy. */
export function sumFutureOvershootTonnes(
  data: DataPoint[],
  currentYear: number,
): number {
  return data
    .filter((point) => point.year >= currentYear)
    .reduce((sum, point) => {
      if (point.trend == null || point.carbonLaw == null) return sum;
      return sum + Math.max(0, point.trend - point.carbonLaw);
    }, 0);
}
