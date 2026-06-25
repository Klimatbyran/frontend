const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/** Scroll progress at which staged bar animations should be fully complete. */
export const NATION_STORY_ANIMATION_END = 0.55;

/** Stagger ranges for sections with up to three sequential items (rows/bars/layers). */
export const NATION_STORY_STAGGER_RANGES: [number, number][] = [
  [0, 0.22],
  [0.18, 0.4],
  [0.36, NATION_STORY_ANIMATION_END],
];

export function getNationStoryScrollBarScale(
  scrollProgress: number,
  barIndex: number,
  barCount: number,
  staggerEnd = NATION_STORY_ANIMATION_END,
): number {
  const globalProgress = clamp(scrollProgress / staggerEnd, 0, 1);

  if (barCount <= 1) {
    return globalProgress;
  }

  // Keep a visible left-to-right wave while still finishing before section center.
  const staggerSpread = 0.3;
  const barStart =
    barCount > 1 ? (barIndex / (barCount - 1)) * staggerSpread : 0;
  const activeWindow = 1 - barStart;

  return clamp((globalProgress - barStart) / activeWindow, 0, 1);
}
