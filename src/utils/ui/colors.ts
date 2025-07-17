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
      return "var(--green-3)";
    case "medium":
      return "var(--orange-3)";
    case "low":
      return "var(--pink-3)";
  }
}
