/** Shared initial center for municipality and region overview maps. */
export const OVERVIEW_MAP_DEFAULT_CENTER: [number, number] = [63, 17];

/** [x, y] inset. The legend sits in a corner on desktop, so the same inset works on every side. */
export const MAP_FIT_BOUNDS_PADDING = [20, 20] as const;

/**
 * On mobile the legend is a full-width bar. A small top inset uses the empty
 * space above the geography; the larger bottom inset keeps the south above the legend.
 * Points are [x, y].
 */
export const MAP_MOBILE_FIT_BOUNDS_PADDING = {
  paddingTopLeft: [20, 8],
  paddingBottomRight: [20, 96],
} as const;
