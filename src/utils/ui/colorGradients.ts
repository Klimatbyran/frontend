/**
 * Color gradient utilities for visualizations
 *
 * Range-based gradients: Fixed mapping based on value ranges
 * Statistical gradients: Adaptive mapping based on z-scores (mean/stdDev)
 */

/**
 * Create a blue-to-pink gradient color based on a value within a symmetric range around 0
 * Used for: trend slope, emissions change (where negative = good, positive = bad)
 *
 * @param min - Minimum value in the dataset
 * @param max - Maximum value in the dataset
 * @param value - The value to get color for
 * @returns CSS color-mix string
 */
export function createSymmetricRangeGradient(
  min: number,
  max: number,
  value: number,
): string {
  // Determine the symmetric range around 0 for color mapping
  const absMax = Math.max(Math.abs(min), Math.abs(max));
  const capped = Math.max(-absMax, Math.min(absMax, value));
  // Normalize: -absMax -> 0, 0 -> 0.5, +absMax -> 1
  const normalized = absMax > 0 ? (capped + absMax) / (2 * absMax) : 0.5;

  // Map to blue-to-pink gradient
  if (normalized <= 0.33) {
    const t = normalized / 0.33;
    return `color-mix(in srgb, var(--blue-5) ${(1 - t) * 100}%, var(--blue-4) ${t * 100}%)`;
  } else if (normalized <= 0.5) {
    const t = (normalized - 0.33) / 0.17;
    return `color-mix(in srgb, var(--blue-4) ${(1 - t) * 100}%, var(--blue-3) ${t * 100}%)`;
  } else if (normalized <= 0.67) {
    const t = (normalized - 0.5) / 0.17;
    return `color-mix(in srgb, var(--blue-3) ${(1 - t) * 100}%, var(--pink-3) ${t * 100}%)`;
  } else {
    const t = (normalized - 0.67) / 0.33;
    return `color-mix(in srgb, var(--pink-3) ${(1 - t) * 100}%, var(--pink-5) ${t * 100}%)`;
  }
}

/**
 * Create a blue-to-pink gradient color based on a value within a fixed range
 * Used for: budget percent (where -100% to +100% is the meaningful range)
 *
 * @param rangeMin - Minimum value of the range (typically -100)
 * @param rangeMax - Maximum value of the range (typically +100)
 * @param value - The value to get color for
 * @returns CSS color-mix string
 */
export function createFixedRangeGradient(
  rangeMin: number,
  rangeMax: number,
  value: number,
): string {
  const capped = Math.max(rangeMin, Math.min(rangeMax, value));
  const normalized = (capped - rangeMin) / (rangeMax - rangeMin);

  // Map to blue-to-pink gradient
  if (normalized <= 0.33) {
    const t = normalized / 0.33;
    return `color-mix(in srgb, var(--blue-5) ${(1 - t) * 100}%, var(--blue-4) ${t * 100}%)`;
  } else if (normalized <= 0.5) {
    const t = (normalized - 0.33) / 0.17;
    return `color-mix(in srgb, var(--blue-4) ${(1 - t) * 100}%, var(--blue-3) ${t * 100}%)`;
  } else if (normalized <= 0.67) {
    const t = (normalized - 0.5) / 0.17;
    return `color-mix(in srgb, var(--blue-3) ${(1 - t) * 100}%, var(--pink-3) ${t * 100}%)`;
  } else {
    const t = (normalized - 0.67) / 0.33;
    return `color-mix(in srgb, var(--pink-3) ${(1 - t) * 100}%, var(--pink-5) ${t * 100}%)`;
  }
}

/**
 * Create a statistical gradient color based on z-score normalization
 * Used for: municipality map, and optionally for company visualizations
 *
 * @param values - All values in the dataset (for calculating mean/stdDev)
 * @param value - The value to get color for
 * @param higherIsBetter - Whether higher values are better (affects color direction)
 * @param colors - Color stops for the gradient (defaults to municipality map colors)
 * @returns CSS color-mix string
 */
export function createStatisticalGradient(
  values: number[],
  value: number,
  higherIsBetter: boolean = false,
  colors: {
    gradientStart: string;
    gradientMidLow: string;
    gradientMidHigh: string;
    gradientEnd: string;
  } = {
    gradientStart: "var(--pink-5)",
    gradientMidLow: "var(--pink-4)",
    gradientMidHigh: "var(--pink-3)",
    gradientEnd: "var(--blue-3)",
  },
): string {
  if (values.length === 0) {
    return colors.gradientMidHigh;
  }

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length,
  );

  if (stdDev === 0) {
    return colors.gradientMidHigh;
  }

  const zScore = (value - mean) / stdDev;
  const { gradientStart, gradientMidLow, gradientMidHigh, gradientEnd } =
    colors;

  if (higherIsBetter) {
    if (zScore <= -1) {
      const t = Math.max(0, (zScore + 2) / 1);
      return `color-mix(in srgb, ${gradientStart} ${(1 - t) * 100}%, ${gradientMidLow} ${t * 100}%)`;
    } else if (zScore <= 0) {
      const t = Math.max(0, zScore + 1);
      return `color-mix(in srgb, ${gradientMidLow} ${(1 - t) * 100}%, ${gradientMidHigh} ${t * 100}%)`;
    } else if (zScore <= 1) {
      const t = Math.max(0, zScore);
      return `color-mix(in srgb, ${gradientMidHigh} ${(1 - t) * 100}%, ${gradientEnd} ${t * 100}%)`;
    } else {
      return gradientEnd;
    }
  } else {
    // Lower is better (e.g., emissions reduction)
    if (zScore >= 1) {
      const t = Math.max(0, (2 - zScore) / 1);
      return `color-mix(in srgb, ${gradientStart} ${(1 - t) * 100}%, ${gradientMidLow} ${t * 100}%)`;
    } else if (zScore >= 0) {
      const t = Math.max(0, 1 - zScore);
      return `color-mix(in srgb, ${gradientMidLow} ${(1 - t) * 100}%, ${gradientMidHigh} ${t * 100}%)`;
    } else if (zScore >= -1) {
      const t = Math.max(0, -zScore);
      return `color-mix(in srgb, ${gradientMidHigh} ${(1 - t) * 100}%, ${gradientEnd} ${t * 100}%)`;
    } else {
      return gradientEnd;
    }
  }
}
