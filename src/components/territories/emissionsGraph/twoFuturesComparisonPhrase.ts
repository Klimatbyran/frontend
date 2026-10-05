/** |trend/Paris − 1| below this → treated as aligned. */
export const PARIS_PATH_ALIGNED_SHARE = 0.005;

export type TrendVsParisCaption =
  | { kind: "aligned" }
  | { kind: "overshoot"; times: number }
  | { kind: "undershoot"; times: number };

function wholeTimesFactor(ratio: number): number {
  const rounded = Math.round(ratio);
  return rounded >= 2 ? rounded : 2;
}

/**
 * Whole-number “times more / less emissions” caption from summed path totals.
 * Uses totalTrend / totalParis (same basis as gapShareOfParis).
 */
export function captionFromPathTotals(
  totalTrend: number,
  totalParis: number,
): TrendVsParisCaption | null {
  if (totalParis <= 0 || totalTrend <= 0) return null;

  const ratio = totalTrend / totalParis;
  if (Math.abs(ratio - 1) <= PARIS_PATH_ALIGNED_SHARE) {
    return { kind: "aligned" };
  }

  if (ratio > 1) {
    return { kind: "overshoot", times: wholeTimesFactor(ratio) };
  }

  return { kind: "undershoot", times: wholeTimesFactor(1 / ratio) };
}
