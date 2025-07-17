/**
 * Company Emissions Calculations - Modular Structure
 *
 * This module provides a comprehensive set of functions for calculating
 * emissions trends, projections, and approximations.
 *
 * The module is organized into focused sub-modules:
 * - types: Shared type definitions for emissions calculations
 * - coefficients: Linear regression coefficient calculations for trend analysis
 * - historical: Historical data approximation to fill gaps between reported years
 * - future: Future trend projections from current year to target year
 * - exponential: Exponential regression functions for non-linear trend analysis
 * - approximated: Sophisticated data generation combining historical and future trends
 * - linearTrend: Linear trend approximation functions for basic projections
 */

// Export types
export type {
  TrendCoefficients,
  ApproximatedHistoricalResult,
  FutureTrendResult,
  ExponentialFit,
  SophisticatedTrendMode,
} from "./types";

// Export coefficient functions
export {
  calculateTrendCoefficients,
  calculateAnchoredTrendCoefficients,
} from "./coefficients";

// Export historical functions
export { calculateApproximatedHistorical } from "./historical";

// Export future functions
export { calculateFutureTrend } from "./future";

// Export exponential functions
export { generateExponentialApproximatedData } from "./exponential";

// Export sophisticated approximation functions
export { generateSophisticatedApproximatedData } from "./approximated";

// Export linear trend functions
export { generateApproximatedData } from "./linearTrend";
