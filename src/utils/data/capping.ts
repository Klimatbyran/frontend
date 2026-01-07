/**
 * Utilities for calculating capping thresholds for data visualization
 */

/**
 * Calculate a dynamic cap threshold based on data distribution
 * Uses 85th percentile of positive values, or median * 2, whichever is larger
 * @param values - Array of numeric values
 * @param minCapInUnit - Minimum cap value in the selected unit (will be multiplied by divisor)
 * @param divisor - Unit divisor (e.g., 1_000_000 for Mt)
 * @returns Cap threshold in raw units
 */
export function calculateCapThreshold(
  values: number[],
  minCapInUnit: number = 3,
  divisor: number = 1,
): number {
  if (values.length === 0) {
    return minCapInUnit * divisor;
  }

  // Get only positive values (over budget/above threshold)
  const positiveValues = values.filter((v) => v > 0).sort((a, b) => a - b);

  if (positiveValues.length === 0) {
    // No positive values, use a default based on unit
    return minCapInUnit * divisor;
  }

  // Calculate 85th percentile
  const percentile85Index = Math.floor(positiveValues.length * 0.85);
  const percentile85 =
    positiveValues[percentile85Index] ||
    positiveValues[positiveValues.length - 1];

  // Calculate median
  const medianIndex = Math.floor(positiveValues.length / 2);
  const median = positiveValues[medianIndex] || 0;

  // Use the larger of: 85th percentile, or median * 2
  const dynamicCap = Math.max(percentile85, median * 2);

  // Minimum cap in the selected unit
  const minCap = minCapInUnit * divisor;

  // Round up to a nice number in the selected unit for cleaner display
  const capInUnit = dynamicCap / divisor;
  const roundedCap = Math.ceil(capInUnit / 1) * 1; // Round to nearest whole number

  return Math.max(roundedCap * divisor, minCap);
}
