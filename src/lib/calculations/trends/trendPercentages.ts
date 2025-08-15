/**
 * Simple utility to calculate percentage change from trend coefficients
 */

/**
 * Calculate percentage change from trend coefficients
 * @param coefficients - Trend analysis coefficients (linear or exponential)
 * @param avgEmissions - Average emissions value (only needed for linear)
 * @returns Percentage change as a number
 */
export function calculateTrendPercentageChange(
  coefficients: { slope: number; intercept: number } | { a: number; b: number },
  avgEmissions: number,
): number {
  if ("slope" in coefficients && "intercept" in coefficients) {
    // Linear coefficients
    return avgEmissions > 0 ? (coefficients.slope / avgEmissions) * 100 : 0;
  } else if ("a" in coefficients && "b" in coefficients) {
    // Exponential coefficients
    return (Math.exp(coefficients.b) - 1) * 100;
  }
  return 0;
}
