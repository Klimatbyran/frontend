/**
 * Color gradient utilities for visualizations
 *
 * Range-based gradients: Fixed mapping based on value ranges
 * Statistical gradients: Adaptive mapping based on z-scores (mean/stdDev)
 * TODO: review if we want to keep all of these or pick 1 method to use for the rankings gradients
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

  const normalized = absMax > 0 ? (capped + absMax) / (2 * absMax) : 0.5;

  // Map to blue-to-pink gradient: blue-4 to pink-5
  // At 0 (normalized 0.5), we want a purple mix
  if (normalized <= 0.4) {
    // Negative side: blue-4 to blue-3
    const t = normalized / 0.4;
    return `color-mix(in srgb, var(--blue-4) ${(1 - t) * 100}%, var(--blue-3) ${t * 100}%)`;
  } else if (normalized <= 0.5) {
    // Transition zone: blue-3 to a purple mix (70% blue-3, 30% pink-3 at 0)
    const t = (normalized - 0.4) / 0.1;
    // At t=0 (normalized 0.4): 100% blue-3
    // At t=1 (normalized 0.5): 70% blue-3, 30% pink-3
    const bluePercent = 100 - t * 30;
    return `color-mix(in srgb, var(--blue-3) ${bluePercent}%, var(--pink-3) ${100 - bluePercent}%)`;
  } else if (normalized <= 0.65) {
    // Just above zero: continue transition from purple mix to pink-3
    const t = (normalized - 0.5) / 0.15;
    // At t=0: 70% blue-3, 30% pink-3
    // At t=1: 100% pink-3
    const bluePercent = 70 * (1 - t);
    return `color-mix(in srgb, var(--blue-3) ${bluePercent}%, var(--pink-3) ${100 - bluePercent}%)`;
  } else if (normalized <= 0.8) {
    // Positive side: pink-3 to pink-4
    const t = (normalized - 0.65) / 0.15;
    return `color-mix(in srgb, var(--pink-3) ${(1 - t) * 100}%, var(--pink-4) ${t * 100}%)`;
  } else {
    // Positive side: pink-4 to pink-5
    const t = (normalized - 0.8) / 0.2;
    return `color-mix(in srgb, var(--pink-4) ${(1 - t) * 100}%, var(--pink-5) ${t * 100}%)`;
  }
}

/**
 * Create a blue-to-pink gradient color based on a value within a fixed range
 * Used for: budget percent (where -100% to +100% is the meaningful range)
 * Transition happens at 0: negative = blue (good), positive = pink (bad)
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

  // If range is symmetric around 0, map 0 to the transition point
  let normalized: number;
  if (rangeMin < 0 && rangeMax > 0) {
    // Normalize around 0: negative values map to 0-0.5, positive to 0.5-1
    const absMax = Math.max(Math.abs(rangeMin), Math.abs(rangeMax));
    normalized =
      capped < 0
        ? 0.5 * (1 + capped / absMax) // -absMax -> 0, 0 -> 0.5
        : 0.5 + 0.5 * (capped / absMax); // 0 -> 0.5, +absMax -> 1
  } else {
    // Non-symmetric range, use standard normalization
    normalized = (capped - rangeMin) / (rangeMax - rangeMin);
  }

  // Map to blue-to-pink gradient: blue-4 to pink-5
  // At 0 (normalized 0.5), we want a purple mix (more blue than pink, but transitioning)
  if (normalized <= 0.4) {
    // Negative side: blue-4 to blue-3
    const t = normalized / 0.4;
    return `color-mix(in srgb, var(--blue-4) ${(1 - t) * 100}%, var(--blue-3) ${t * 100}%)`;
  } else if (normalized <= 0.5) {
    // Transition zone: blue-3 to a purple mix (70% blue-3, 30% pink-3 at 0)
    const t = (normalized - 0.4) / 0.1;
    // At t=0 (normalized 0.4): 100% blue-3
    // At t=1 (normalized 0.5): 70% blue-3, 30% pink-3
    const bluePercent = 100 - t * 30;
    return `color-mix(in srgb, var(--blue-3) ${bluePercent}%, var(--pink-3) ${100 - bluePercent}%)`;
  } else if (normalized <= 0.65) {
    // Just above zero: continue transition from purple mix to pink-3
    const t = (normalized - 0.5) / 0.15;
    // At t=0: 70% blue-3, 30% pink-3
    // At t=1: 100% pink-3
    const bluePercent = 70 * (1 - t);
    return `color-mix(in srgb, var(--blue-3) ${bluePercent}%, var(--pink-3) ${100 - bluePercent}%)`;
  } else if (normalized <= 0.8) {
    // Positive side: pink-3 to pink-4
    const t = (normalized - 0.65) / 0.15;
    return `color-mix(in srgb, var(--pink-3) ${(1 - t) * 100}%, var(--pink-4) ${t * 100}%)`;
  } else {
    // Positive side: pink-4 to pink-5
    const t = (normalized - 0.8) / 0.2;
    return `color-mix(in srgb, var(--pink-4) ${(1 - t) * 100}%, var(--pink-5) ${t * 100}%)`;
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
