/**
 * Company Emissions Calculations - Modular Structure
 *
 */

// Export types
export type {
  TrendCoefficients,
  ApproximatedHistoricalResult,
  FutureTrendResult,
  ExponentialFit,
  SophisticatedTrendMode,
} from "./types";

// Export linear trend functions
export { generateApproximatedData } from "./linearTrend";
