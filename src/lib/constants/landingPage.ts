import type { HeroSearchResult } from "@/hooks/usePopularHeroItems";

// Landing page animation and interaction constants
export const TYPEWRITER_SPEED = 70;
export const TYPEWRITER_WAIT_TIME = 2000;
export const TYPEWRITER_DELETE_SPEED = 40;
export const TYPEWRITER_CURSOR_CHAR = "_";

// Scroll and throttle constants
export const SCROLL_THROTTLE_DELAY = 100;

// Hero search constants
export const HERO_SEARCH_DEBOUNCE_MS = 350;
export const HERO_SEARCH_MAX_RESULTS = 8;
export const HERO_SEARCH_MAX_RESULTS_PER_TYPE = 4;

export const POPULAR_HERO_ITEMS: HeroSearchResult[] = [
  { type: "municipality", name: "Stockholm" },
  { type: "company", name: "H&M", id: "Q188326" },
  { type: "region", name: "Skåne län" },
];
