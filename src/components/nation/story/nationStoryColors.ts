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
