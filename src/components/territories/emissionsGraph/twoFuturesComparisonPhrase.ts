/** |trend/Paris − 1| below this → treated as aligned. */
export const PARIS_PATH_ALIGNED_SHARE = 0.005;

/** Closer than this to a whole number → say that many times, not "more than". */
const NEAR_WHOLE_TIMES = 0.03;

export type TrendVsParisCaption =
  | { kind: "aligned" }
  | { kind: "overshootMild" }
  | { kind: "undershootMild" }
  | { kind: "overshoot"; times: number; moreThan: boolean }
  | { kind: "undershoot"; times: number; moreThan: boolean };

/**
 * Whole-number “times” for a ratio above 1.
 * 3.4 is more than 3, not 3. 1.1 is not yet 2.
 */
function describeMultiple(
  ratio: number,
): { times: number; moreThan: boolean } | "mild" {
  const nearest = Math.round(ratio);
  if (nearest >= 2 && Math.abs(ratio - nearest) <= NEAR_WHOLE_TIMES) {
    return { times: nearest, moreThan: false };
  }

  const times = Math.floor(ratio);
  if (times < 2) return "mild";
  return { times, moreThan: true };
}

/**
 * “Times more / less” caption from the areas under the trend and Paris paths.
 * A ratio above a whole number stays “more than” that number — it is not
 * rounded back down.
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
    const described = describeMultiple(ratio);
    if (described === "mild") return { kind: "overshootMild" };
    return { kind: "overshoot", ...described };
  }

  const described = describeMultiple(1 / ratio);
  if (described === "mild") return { kind: "undershootMild" };
  return { kind: "undershoot", ...described };
}
