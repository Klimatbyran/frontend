import { SupportedLanguage } from "@/lib/languageDetection";

// Helper function to get latest year's data
export function getSectorsReportingYear(): number {
  return new Date().getFullYear() - 2;
}

/** Fraction of the calendar year elapsed at `date` (0 at Jan 1, 1 at Dec 31 end). */
export function getYearProgress(date: Date = new Date()): number {
  const year = date.getFullYear();
  const start = new Date(year, 0, 1).getTime();
  const end = new Date(year + 1, 0, 1).getTime();
  const elapsed = date.getTime() - start;
  const total = end - start;
  if (total <= 0) {
    return 1;
  }
  return Math.min(1, Math.max(0, elapsed / total));
}

/** Chart x-position for “today” within the current calendar year. */
export function getCurrentYearChartPosition(date: Date = new Date()): number {
  const year = date.getFullYear();
  return year + getYearProgress(date);
}

export function isPartialChartYear(chartYear: number): boolean {
  const progress = chartYear - Math.floor(chartYear);
  return progress > 0 && progress < 1;
}

/** Format a fractional chart year (e.g. 2026.5) as a calendar date like "2 Jul 2026". */
export function formatChartYearLabel(
  chartYear: number,
  language: SupportedLanguage,
): string {
  const calendarYear = Math.floor(chartYear);
  const progress = chartYear - calendarYear;

  if (progress <= 0 || progress >= 1) {
    return String(calendarYear);
  }

  const start = new Date(calendarYear, 0, 1).getTime();
  const end = new Date(calendarYear + 1, 0, 1).getTime();
  const date = new Date(start + progress * (end - start));

  return new Intl.DateTimeFormat(language === "sv" ? "sv-SE" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getLatestYearData<T>(
  data: Record<string, T> | undefined,
): T | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const years = Object.keys(data)
    .map(Number)
    .filter((year) => !isNaN(year))
    .sort((a, b) => b - a);

  return years.length > 0 ? data[years[0].toString()] : undefined;
}

// Helper function to get all years from data
export function getAvailableYears(
  data: Record<string, unknown> | undefined,
): number[] {
  if (!data || typeof data !== "object") {
    return [];
  }

  return Object.keys(data)
    .map(Number)
    .filter((year) => !isNaN(year))
    .sort((a, b) => b - a);
}
