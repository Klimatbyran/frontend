/** High-contrast palette tuned for the dark Valet 2026 story page. */
export const NATION_STORY_COLORS = {
  territorial: "var(--orange-3)",
  production: "var(--blue-2)",
  consumption: "var(--pink-3)",
  eCommerce: "#ffffff",
  biogenic: "var(--green-2)",
} as const;

export const NATION_STORY_CHART = {
  fillOpacity: 0.88,
  strokeWidth: 2.5,
} as const;

/**
 * Text colors matching the site-wide convention: white for primary copy,
 * grey (#878787) for secondary copy — no white-opacity variants.
 */
export const NATION_STORY_TEXT = {
  /** Narrative copy — grey like `.prose` body text on the rest of the site */
  body: "text-grey",
  secondary: "text-grey",
  eyebrow: "text-grey",
} as const;

/**
 * Type scale mapped onto the site's design tokens (DM Sans light,
 * tight tracking, `.prose`-style body copy, `text-display` for stats).
 */
export const NATION_STORY_TYPE = {
  /** Section titles (intro, interlude, conclusion, stacked chart) */
  title: "text-3xl md:text-5xl font-light tracking-tight leading-tight",
  /** Narrative paragraphs and step body copy */
  body: "text-base md:text-lg leading-snug",
  /** Step/layer headers with color dots – same size as body, heavier weight */
  emphasis: "text-base md:text-lg font-medium",
  /** Eyebrows like “Conclusion” */
  eyebrow: "text-sm md:text-base",
  /** Legend rows, data-year, bathtub captions */
  meta: "text-sm md:text-base",
  /** Large stats (conclusion totals, hero callouts) */
  display: "text-4xl md:text-display font-light tabular-nums leading-none",
  /** Mid stats (bathtub year, onion total) */
  stat: "text-2xl md:text-5xl font-light tabular-nums tracking-tight",
} as const;
