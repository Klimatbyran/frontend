import type { RankedCompany } from "@/types/company";
import type { TrendAnalysis } from "@/lib/calculations/trends/types";
import {
  get2025Emissions,
  calculateCumulativeEmissions,
  calculateCarbonLawCumulativeEmissions,
} from "@/lib/calculations/trends/meetsParis";

const UNDER_BUDGET_SENTINEL = -1_000_000;

/**
 * Calculate the tonnes above or below the carbon budget
 *
 * @param trendAnalysis - The trend analysis for the company
 * @returns Tonnes value: negative = under budget (good), positive = over budget (bad)
 *          Returns null if calculation cannot be performed
 */
export const calculateCarbonBudgetTonnes = (
  company: RankedCompany,
  trendAnalysis: TrendAnalysis | null,
): number | null => {
  if (!trendAnalysis || !trendAnalysis.coefficients) return null;

  const emissions2025 = get2025Emissions(company, trendAnalysis);
  if (emissions2025 === null || emissions2025 === undefined) return null;

  // If emissions are 0 or negative, company is definitely under budget
  if (emissions2025 <= 0) return UNDER_BUDGET_SENTINEL;

  // Extract slope from coefficients (handle both formats)
  const slope =
    "slope" in trendAnalysis.coefficients
      ? trendAnalysis.coefficients.slope
      : trendAnalysis.coefficients.a;

  const companyCumulativeEmissions = calculateCumulativeEmissions(
    emissions2025,
    slope,
    2025,
    2050,
  );

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
