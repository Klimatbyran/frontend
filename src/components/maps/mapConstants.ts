/** Shared initial center for municipality and region overview maps. */
export const OVERVIEW_MAP_DEFAULT_CENTER: [number, number] = [63, 17];

export const MAP_FIT_BOUNDS_PADDING = [20, 20] as const;
/**
 * Leave a strip under the country for the legend, and a little room at the
 * edges for the zoom controls.
 */
export const OVERVIEW_MAP_FIT_BOUNDS_PADDING = {
  paddingTopLeft: [16, 12] as [number, number],
  paddingBottomRight: [16, 92] as [number, number],
};
/** Extra bottom inset on detail maps so fitBounds keeps geography above the mobile legend. */
export const DETAIL_MAP_MOBILE_FIT_BOUNDS_PADDING = [20, 20, 96, 20] as const;
