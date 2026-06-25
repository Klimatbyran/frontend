const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/** Scroll progress at which staged bar animations should be fully complete. */
export const NATION_STORY_ANIMATION_END = 0.38;

/** Stagger ranges for sections with up to three sequential items (rows/bars/layers). */
export const NATION_STORY_STAGGER_RANGES: [number, number][] = [
  [0, 0.14],
  [0.11, 0.26],
  [0.22, NATION_STORY_ANIMATION_END],
];

export function getNationStoryScrollBarScale(
  scrollProgress: number,
  barIndex: number,
  barCount: number,
  staggerEnd = NATION_STORY_ANIMATION_END,
): number {
  if (barCount <= 1) {
    return clamp(scrollProgress / staggerEnd, 0, 1);
  }

  const overlap = 0.08 / barCount;
  const segment = staggerEnd / barCount;
  const start = barIndex * segment;
  const end = start + segment + overlap;

  return clamp((scrollProgress - start) / (end - start), 0, 1);
}
