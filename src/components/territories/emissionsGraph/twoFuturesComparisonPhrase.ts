/** Smaller than this vs Paris total → treated as aligned. */
export const PARIS_PATH_ALIGNED_SHARE = 0.005;

type PhraseCandidate = {
  /** |gapShareOfParis| for this wording (see compareFuturePathTotals). */
  gapShare: number;
  key: string;
};

const OVERSHOOT_PHRASES: PhraseCandidate[] = [
  { gapShare: 0.125, key: "eighthMore" },
  { gapShare: 0.25, key: "quarterMore" },
  { gapShare: 1 / 3, key: "thirdMore" },
  { gapShare: 0.5, key: "halfMore" },
  { gapShare: 2 / 3, key: "twoThirdsMore" },
  { gapShare: 0.75, key: "threeQuartersMore" },
  { gapShare: 1, key: "double" },
  { gapShare: 2, key: "triple" },
];

const UNDERSHOOT_PHRASES: PhraseCandidate[] = [
  { gapShare: 0.125, key: "eighthLess" },
  { gapShare: 0.25, key: "quarterLess" },
  { gapShare: 1 / 3, key: "thirdLess" },
  { gapShare: 0.5, key: "halfLess" },
  { gapShare: 2 / 3, key: "twoThirdsLess" },
  { gapShare: 0.75, key: "threeQuartersLess" },
];

/** Pick the closest plain-language comparison to the Paris-path gap. */
export function pickTrendVsParisPhraseKey(
  gapShareOfParis: number,
): string | null {
  if (Math.abs(gapShareOfParis) < PARIS_PATH_ALIGNED_SHARE) return null;

  const candidates =
    gapShareOfParis > 0 ? OVERSHOOT_PHRASES : UNDERSHOOT_PHRASES;
  const target = Math.abs(gapShareOfParis);

  let best = candidates[0];
  let bestDistance = Infinity;
  for (const candidate of candidates) {
    const distance = Math.abs(candidate.gapShare - target);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }

  return best.key;
}
