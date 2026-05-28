import type { TrendAnalysis, CompanyForTrendAnalysis } from "./types";

// Carbon Law reduction rate constant (11.72% annual reduction)
const CARBON_LAW_REDUCTION_RATE = 0.1172;

/**
 * Get 2025 emissions (actual data or estimated from trendline)
 */
export const get2025Emissions = (
  company: CompanyForTrendAnalysis,
  trendAnalysis: TrendAnalysis | null,
): number | null => {
  if (!trendAnalysis || !trendAnalysis.coefficients) return null;

  // Check if we have actual 2025 data
  const actual2025Data = company.reportingPeriods?.find(
    (period) => new Date(period.endDate).getFullYear() === 2025,
  );

  if (actual2025Data?.emissions?.calculatedTotalEmissions) {
    return actual2025Data.emissions.calculatedTotalEmissions;
  }

  // Estimate 2025 emissions from trendline
  const slope =
    "slope" in trendAnalysis.coefficients
      ? trendAnalysis.coefficients.slope
      : trendAnalysis.coefficients.a;
  const intercept =
    "intercept" in trendAnalysis.coefficients
      ? trendAnalysis.coefficients.intercept
      : trendAnalysis.coefficients.b;
  return slope * 2025 + intercept;
};

/**
 * Calculate cumulative emissions for a linear trendline from startYear to endYear
 */
export const calculateCumulativeEmissions = (
  startEmissions: number,
  slope: number,
  startYear: number,
  endYear: number,
): number => {
  let cumulative = 0;
  for (let year = startYear; year <= endYear; year++) {
    // Calculate emissions for this year using the trendline equation
    // emissions = slope * year + intercept, where intercept = startEmissions - slope * startYear
    const emissions = slope * year + (startEmissions - slope * startYear);
    cumulative += Math.max(0, emissions); // Don't allow negative emissions
  }
  return cumulative;
};

/**
 * Calculate cumulative emissions for Carbon Law (11.72% yearly decrease)
 */
export const calculateCarbonLawCumulativeEmissions = (
  startEmissions: number,
  startYear: number,
  endYear: number,
): number => {
  let cumulative = 0;
  let currentEmissions = startEmissions;

  for (let year = startYear; year <= endYear; year++) {
    cumulative += currentEmissions;
    currentEmissions *= 1 - CARBON_LAW_REDUCTION_RATE; // 11.72% yearly decrease
  }
  return cumulative;
};

/**
 * Calculate if company meets Paris Agreement based on cumulative emissions 2025-2050
 * Uses the carbon budget approach: company's cumulative emissions must be <= Carbon Law cumulative emissions
 */
export const calculateMeetsParis = (
  company: CompanyForTrendAnalysis,
  trendAnalysis: TrendAnalysis | null,
): boolean => {
  if (!trendAnalysis || !trendAnalysis.coefficients) return false;

  // Get 2025 emissions (actual or estimated)
  const emissions2025 = get2025Emissions(company, trendAnalysis);

  // Handle null/undefined (can't calculate)
  if (emissions2025 === null || emissions2025 === undefined) return false;

  // If emissions are already 0 or negative in 2025, company definitely meets Paris
  // (they have no emissions to exceed the carbon budget)
  if (emissions2025 <= 0) return true;

  // Extract slope from coefficients (handle both formats)
  const slope =
    "slope" in trendAnalysis.coefficients
      ? trendAnalysis.coefficients.slope
      : trendAnalysis.coefficients.a;

  // Calculate cumulative emissions for company trendline 2025-2050
  const companyCumulativeEmissions = calculateCumulativeEmissions(
    emissions2025,
    slope,
    2025,
    2050,
  );

  // Calculate cumulative emissions for Carbon Law (11.72% yearly decrease) 2025-2050
  const carbonLawCumulativeEmissions = calculateCarbonLawCumulativeEmissions(
    emissions2025,
    2025,
    2050,
  );

  // Company meets Paris if their cumulative emissions <= Carbon Law cumulative emissions
  return companyCumulativeEmissions <= carbonLawCumulativeEmissions;
};
