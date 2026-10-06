/** |trend/Paris − 1| below this → treated as aligned. */
export const PARIS_PATH_ALIGNED_SHARE = 0.005;

export type TrendVsParisCaption =
  | { kind: "aligned" }
  | { kind: "overshootMild" }
  | { kind: "undershootMild" }
  | { kind: "overshoot"; times: number }
  | { kind: "undershoot"; times: number };

/**
 * Nearest whole “times more / less” from the trend and Paris values in one year.
 * 18.8 rounds to 19. A ratio that is not yet 1.5 does not become 2.
 */
export function captionFromPathTotals(
  trend: number,
  paris: number,
): TrendVsParisCaption | null {
  if (paris <= 0 || trend < 0) return null;
  if (trend === 0) return { kind: "undershootMild" };

  const ratio = trend / paris;
  if (Math.abs(ratio - 1) <= PARIS_PATH_ALIGNED_SHARE) {
    return { kind: "aligned" };
  }

  if (ratio > 1) {
    const times = Math.round(ratio);
    if (times < 2) return { kind: "overshootMild" };
    return { kind: "overshoot", times };
  }

  const times = Math.round(1 / ratio);
  if (times < 2) return { kind: "undershootMild" };
  return { kind: "undershoot", times };
}
