/** Shared initial center for municipality and region overview maps. */
export const OVERVIEW_MAP_DEFAULT_CENTER: [number, number] = [63, 17];

export const MAP_FIT_BOUNDS_PADDING = [20, 20] as const;
/** Extra bottom inset on detail maps so fitBounds keeps geography above the mobile legend. */
export const DETAIL_MAP_MOBILE_FIT_BOUNDS_PADDING = [20, 20, 96, 20] as const;
