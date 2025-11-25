import type { RankedCompany } from "@/types/company";
import type { TrendAnalysis } from "@/lib/calculations/trends/types";
import {
  get2025Emissions,
  calculateCumulativeEmissions,
  calculateCarbonLawCumulativeEmissions,
} from "@/lib/calculations/trends/meetsParis";

/**
 * Calculate the percentage above or below the carbon budget
 *
 * @param company - The company to calculate for
 * @param trendAnalysis - The trend analysis for the company
 * @returns Percentage value: negative = under budget (good), positive = over budget (bad)
 *          Returns null if calculation cannot be performed
 */
export const calculateCarbonBudgetPercent = (
  company: RankedCompany,
  trendAnalysis: TrendAnalysis | null,
): number | null => {
  if (!trendAnalysis || !trendAnalysis.coefficients) return null;

  // Get 2025 emissions (actual or estimated)
  const emissions2025 = get2025Emissions(company, trendAnalysis);
  if (emissions2025 === null || emissions2025 === undefined) return null;

  // If emissions are 0 or negative, company is definitely under budget
  // Return a very negative percentage to represent "infinitely under budget"
  // This is better than null so they can be included in visualizations
  if (emissions2025 <= 0) return -1000;

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

  if (carbonLawCumulativeEmissions === 0) return null;

  // Calculate percentage difference: ((trendline - budget) / budget) * 100
  // Negative = under budget, positive = over budget
  const percentDiff =
    ((companyCumulativeEmissions - carbonLawCumulativeEmissions) /
      carbonLawCumulativeEmissions) *
    100;

  return percentDiff;
};

/**
 * Calculate the tonnes above or below the carbon budget
 *
 * @param company - The company to calculate for
 * @param trendAnalysis - The trend analysis for the company
 * @returns Tonnes value: negative = under budget (good), positive = over budget (bad)
 *          Returns null if calculation cannot be performed
 */
export const calculateCarbonBudgetTonnes = (
  company: RankedCompany,
  trendAnalysis: TrendAnalysis | null,
): number | null => {
  if (!trendAnalysis || !trendAnalysis.coefficients) return null;

  // Get 2025 emissions (actual or estimated)
  const emissions2025 = get2025Emissions(company, trendAnalysis);
  if (emissions2025 === null || emissions2025 === undefined) return null;

  // If emissions are 0 or negative, company is definitely under budget
  // Return a very negative value to represent "infinitely under budget"
  if (emissions2025 <= 0) return -1000000;

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

  if (carbonLawCumulativeEmissions === 0) return null;

  // Calculate difference in tonnes: trendline - budget
  // Negative = under budget, positive = over budget
  const tonnesDiff = companyCumulativeEmissions - carbonLawCumulativeEmissions;

  return tonnesDiff;
};
