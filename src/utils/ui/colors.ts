/**
 * UI Color utilities for consistent theming across the application
 */

/**
 * Get CSS color variable for data quality indicators
 * @param quality - The quality level: "high", "medium", or "low"
 * @returns CSS color variable string
 */
export function getDataQualityColor(
  quality: "high" | "medium" | "low",
): string {
  switch (quality) {
    case "high":
      return "var(--blue-3)";
    case "medium":
      return "var(--orange-3)";
    case "low":
      return "var(--pink-3)";
  }
}

export const DEFAULT_POSITIVE_COLOR = "var(--blue-3)";
export const DEFAULT_NEGATIVE_COLOR = "var(--pink-3)";
export const DEFAULT_NEGATIVE_BOOLEAN_COLOR = "var(--pink-4)";

/** KPI / copy colors when the value means “meets Paris” (yes / on track). */
export const MEETS_PARIS_POSITIVE_COLOR = "var(--green-3)";
export const MEETS_PARIS_POSITIVE_CLASS = "text-green-3";

const MEETS_PARIS_KPI_KEYS = new Set(["meetsParis", "meetsParisGoal"]);

export function isMeetsParisKpiKey(key: string | number): boolean {
  return MEETS_PARIS_KPI_KEYS.has(String(key));
}

export function getPositiveIndicatorColor(forMeetsParis: boolean): string {
  return forMeetsParis ? MEETS_PARIS_POSITIVE_COLOR : DEFAULT_POSITIVE_COLOR;
}

export function getPositiveIndicatorClass(forMeetsParis: boolean): string {
  return forMeetsParis ? MEETS_PARIS_POSITIVE_CLASS : "text-blue-3";
}

export const DEFAULT_NULL_DATA_COLOR = "var(--grey)";
