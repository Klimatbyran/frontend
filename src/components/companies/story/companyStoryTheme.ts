/**
 * Visual identity for the company story. Unlike the nation story's layered
 * rings, this page is built on a swarm of company dots and a verdict palette:
 * green for companies keeping the Paris pace, pink for those that are not.
 */
export const COMPANY_STORY_COLORS = {
  /** Neutral dot color in the intro field, before any verdict */
  field: "var(--blue-2)",
  aligned: "var(--green-3)",
  notAligned: "var(--pink-3)",
  /** The Carbon Law descent line */
  pace: "var(--orange-3)",
  neutral: "var(--grey)",
} as const;

export const COMPANY_STORY_TEXT_CLASSES = {
  aligned: "text-green-3",
  notAligned: "text-pink-3",
  pace: "text-orange-3",
  field: "text-blue-2",
} as const;

export type SwarmPoint = { x: number; y: number };

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Sunflower-style phyllotaxis positions around (0,0). Index 0 sits in the
 * middle, so feeding dots sorted by emissions puts the biggest emitters at
 * the heart of the swarm.
 */
export function phyllotaxis(count: number, spread: number): SwarmPoint[] {
  return Array.from({ length: count }, (_, i) => {
    const radius = spread * Math.sqrt(i + 0.5);
    const angle = i * GOLDEN_ANGLE;
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    };
  });
}

/** Spread that packs `count` phyllotaxis dots inside `maxRadius`. */
export function swarmSpread(count: number, maxRadius: number): number {
  if (count <= 0) return maxRadius;
  return maxRadius / Math.sqrt(count + 0.5);
}

/** Uniform dot radius that reads as a dense-but-separated swarm. */
export function uniformDotRadius(spread: number): number {
  return spread * 0.42;
}
