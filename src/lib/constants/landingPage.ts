import type { HeroSearchResult } from "@/types/landing";

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

/** Landing section typography/layout – laptop-only bumps (768–1279px); mobile + xl+ unchanged. */
export const LANDING_SECTION_TITLE_CLASS =
  "text-3xl sm:text-4xl font-light landing-laptop:text-4xl landing-laptop:sm:text-[2.75rem] landing-laptop:leading-tight";

export const LANDING_SECTION_BODY_CLASS =
  "text-grey font-regular text-[18px] landing-laptop:text-xl landing-laptop:leading-relaxed";

export const LANDING_SECTION_ROW_CLASS =
  "flex w-full flex-col items-start gap-8 landing-laptop:flex-row landing-laptop:gap-10 lg:flex-row lg:gap-12";

export const LANDING_TEXT_COLUMN_CLASS = "w-full landing-laptop:w-2/5 lg:w-2/5";

export const LANDING_VISUAL_COLUMN_CLASS =
  "w-full landing-laptop:w-3/5 lg:w-3/5";

export const LANDING_CHART_PANEL_HEIGHT_CLASS =
  "w-full h-[520px] landing-laptop:h-[600px]";

export const LANDING_TEXT_BLOCK_MAX_CLASS =
  "w-full max-w-[760px] landing-laptop:max-w-[880px]";
