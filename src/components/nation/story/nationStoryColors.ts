/** High-contrast palette tuned for the dark Valet 2026 story page. */
export const NATION_STORY_COLORS = {
  territorial: "var(--orange-3)",
  production: "var(--blue-2)",
  consumption: "var(--pink-3)",
  eCommerceRing: "var(--pink-1)",
  biogenic: "var(--green-2)",
} as const;

export const NATION_STORY_CHART = {
  fillOpacity: 0.88,
  strokeWidth: 2.5,
} as const;

/** Shared typography for readable body copy on black backgrounds. */
export const NATION_STORY_TEXT = {
  body: "text-white/90",
  secondary: "text-white/75",
  eyebrow: "text-white/70",
} as const;

/**
 * Tight type scale for the story so each viewport uses a few sizes,
 * not a unique size per line. Mobile and desktop still step independently.
 */
export const NATION_STORY_TYPE = {
  /** Section titles (intro, interlude, conclusion, stacked chart) */
  title: "text-2xl md:text-5xl font-light",
  /** Narrative paragraphs and step body copy */
  body: "text-base md:text-xl leading-snug md:leading-relaxed",
  /** Step/layer headers with color dots – same size as body, heavier weight */
  emphasis: "text-base md:text-xl font-medium",
  /** Eyebrows like “Conclusion” */
  eyebrow: "text-sm md:text-lg uppercase tracking-widest",
  /** Legend rows, data-year, bathtub captions */
  meta: "text-sm md:text-base",
  /** Large stats (conclusion totals) */
  display: "text-4xl md:text-8xl font-light tabular-nums leading-none",
  /** Mid stats (bathtub year, onion total) */
  stat: "text-2xl md:text-5xl font-light tabular-nums",
} as const;
