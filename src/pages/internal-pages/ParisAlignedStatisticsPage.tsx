import { useMemo } from "react";
import { Text } from "@/components/ui/text";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { calculateMeetsParis } from "@/lib/calculations/trends/meetsParis";
import { calculateCarbonBudgetTonnes } from "@/utils/calculations/carbonBudget";
import {
  get2025Emissions,
  calculateCumulativeEmissions,
  calculateCarbonLawCumulativeEmissions,
} from "@/lib/calculations/trends/meetsParis";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSEO } from "@/components/SEO/PageSEO";

export function ParisAlignedStatisticsPage() {
  const { companies, loading, error } = useCompanies();

  const statistics = useMemo(() => {
    if (!companies || companies.length === 0) {
      return null;
    }

    let totalCompaniesWithEmissionsData = 0;
    let totalCompaniesMeetsParisYes = 0;
    let totalCompaniesMeetsParisNo = 0;
    let totalCompaniesMeetsParisUnknown = 0;
    let totalCompaniesWithSlopeData = 0;
    let totalCompaniesCalculableMeetsParis = 0;
    let totalCarbonBudget = 0;
    let totalProjectedEmissions = 0;
    let totalTonnesDiffFromBudget = 0;

    companies.forEach((company) => {
      // Check if company has any non-null emissions data (any year)
      const hasEmissionsData = company.reportingPeriods?.some(
        (period) =>
          period.emissions &&
          period.emissions.calculatedTotalEmissions !== null &&
          period.emissions.calculatedTotalEmissions !== undefined,
      );

      if (hasEmissionsData) {
        totalCompaniesWithEmissionsData++;
      }

      // Calculate trendline (this requires slope from API)
      const trendAnalysis = calculateTrendline(company);

      // Check if we have slope data
      const hasSlopeData =
        company.futureEmissionsTrendSlope !== null &&
        company.futureEmissionsTrendSlope !== undefined;

      if (hasSlopeData) {
        totalCompaniesWithSlopeData++;
      }

      // Calculate meets Paris status
      const meetsParis = trendAnalysis
        ? calculateMeetsParis(company, trendAnalysis)
        : null; // null = unknown

      if (meetsParis === true) {
        totalCompaniesMeetsParisYes++;
      } else if (meetsParis === false) {
        totalCompaniesMeetsParisNo++;
      } else {
        // meetsParis === null (unknown)
        totalCompaniesMeetsParisUnknown++;
      }

      // Only calculate budget/emissions for companies where we can determine Yes/No (not Unknown)
      if (meetsParis !== null && trendAnalysis) {
        totalCompaniesCalculableMeetsParis++;

        // Get 2025 emissions
        // get2025Emissions checks for actual 2025 data first, then estimates from trendline if not available
        // The trendline is built using the slope from the API, which is calculated from historical data
        const emissions2025 = get2025Emissions(company, trendAnalysis);

        if (
          emissions2025 !== null &&
          emissions2025 !== undefined &&
          trendAnalysis.coefficients
        ) {
          // Extract slope from coefficients
          const slope =
            "slope" in trendAnalysis.coefficients
              ? trendAnalysis.coefficients.slope
              : trendAnalysis.coefficients.a;

          // Calculate cumulative emissions for company trendline 2025-2050
          // This uses the linear trendline built from historical data (slope)
          // Starting from 2025 emissions (real data if available, otherwise estimated)
          // Note: calculateCumulativeEmissions uses Math.max(0, emissions) to ensure
          // emissions never go below 0 (no negative emissions are subtracted)
          const companyCumulativeEmissions = calculateCumulativeEmissions(
            emissions2025,
            slope,
            2025,
            2050,
          );

          // Calculate cumulative emissions for Carbon Law (11.72% yearly decrease) 2025-2050
          const carbonLawCumulativeEmissions =
            calculateCarbonLawCumulativeEmissions(emissions2025, 2025, 2050);

          // Use calculateCarbonBudgetTonnes for consistency and to handle edge cases
          // (e.g., when emissions2025 <= 0, it returns UNDER_BUDGET_SENTINEL)
          const tonnesDiff = calculateCarbonBudgetTonnes(
            company,
            trendAnalysis,
          );

          // Add to totals
          totalCarbonBudget += carbonLawCumulativeEmissions;
          totalProjectedEmissions += companyCumulativeEmissions;
          // Use the difference from calculateCarbonBudgetTonnes for consistency
          // If UNDER_BUDGET_SENTINEL is returned, use the actual calculated difference
          // (which would be negative since emissions are 0 or negative)
          if (tonnesDiff !== null) {
            if (tonnesDiff === -1_000_000) {
              // Company is under budget (emissions2025 <= 0)
              // Use actual calculated difference (negative value)
              totalTonnesDiffFromBudget +=
                companyCumulativeEmissions - carbonLawCumulativeEmissions;
            } else {
              totalTonnesDiffFromBudget += tonnesDiff;
            }
          }
        }
      }
    });

    return {
      totalCompaniesWithEmissionsData,
      totalCompaniesMeetsParisYes,
      totalCompaniesMeetsParisNo,
      totalCompaniesMeetsParisUnknown,
      totalCompaniesWithSlopeData,
      totalCompaniesCalculableMeetsParis,
      totalCarbonBudget,
      totalProjectedEmissions,
      totalTonnesDiffFromBudget,
    };
  }, [companies]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Text variant="h1" className="text-white">
          Loading Paris alignment statistics...
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Text variant="h1" className="text-red-400">
          Error loading data: {error.toString()}
        </Text>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Text variant="h1" className="text-white">
          No data available
        </Text>
      </div>
    );
  }

  // Format large numbers with commas
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Format large numbers with commas and 2 decimal places for tonnes
  const formatTonnes = (num: number): string => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(num);
  };

  return (
    <>
      <PageSEO
        title="Paris Aligned Statistics - Internal"
        description="Internal dashboard showing aggregated Paris alignment statistics"
        canonicalUrl="https://klimatkollen.se/internal/paris-aligned-statistics"
      />

      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Paris Aligned Statistics"
          description="Aggregated statistics about companies and their Paris alignment status"
        />

        <div className="mt-8 space-y-6">
          <div className="bg-black rounded-lg shadow p-6">
            <Text variant="h2" className="mb-4 text-white">
              Summary Statistics
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-gray-700 rounded-lg p-4">
                <Text variant="small" className="text-gray-300 mb-1">
                  Companies with Emissions Data
                </Text>
                <Text variant="h3" className="font-bold text-white">
                  {formatNumber(statistics.totalCompaniesWithEmissionsData)}
                </Text>
                <Text variant="small" className="text-gray-400 mt-1">
                  Total number of companies with non-null emissions data (any
                  year)
                </Text>
              </div>

              <div className="border border-gray-700 rounded-lg p-4">
                <Text variant="small" className="text-gray-300 mb-1">
                  Companies "Yes" on Track for Paris
                </Text>
                <Text variant="h3" className="font-bold text-green-400">
                  {formatNumber(statistics.totalCompaniesMeetsParisYes)}
                </Text>
                <Text variant="small" className="text-gray-400 mt-1">
                  Companies that are on track to meet Paris Agreement targets
                </Text>
              </div>

              <div className="border border-gray-700 rounded-lg p-4">
                <Text variant="small" className="text-gray-300 mb-1">
                  Companies with Slope Data
                </Text>
                <Text variant="h3" className="font-bold text-white">
                  {formatNumber(statistics.totalCompaniesWithSlopeData)}
                </Text>
                <Text variant="small" className="text-gray-400 mt-1">
                  Companies with trend slope data from the API
                </Text>
              </div>

              <div className="border border-gray-700 rounded-lg p-4">
                <Text variant="small" className="text-gray-300 mb-1">
                  Calculable Meets Paris
                </Text>
                <Text variant="h3" className="font-bold text-white">
                  {formatNumber(statistics.totalCompaniesCalculableMeetsParis)}
                </Text>
                <Text variant="small" className="text-gray-400 mt-1">
                  Companies where we can calculate Yes/No (excludes Unknown)
                </Text>
              </div>

              <div className="border border-gray-700 rounded-lg p-4">
                <Text variant="small" className="text-gray-300 mb-1">
                  Companies "No" - Failing
                </Text>
                <Text variant="h3" className="font-bold text-red-400">
                  {formatNumber(statistics.totalCompaniesMeetsParisNo)}
                </Text>
                <Text variant="small" className="text-gray-400 mt-1">
                  Companies that are not on track to meet Paris Agreement
                  targets
                </Text>
              </div>

              <div className="border border-gray-700 rounded-lg p-4">
                <Text variant="small" className="text-gray-300 mb-1">
                  Companies "Unknown" if Meets Paris
                </Text>
                <Text variant="h3" className="font-bold text-yellow-400">
                  {formatNumber(statistics.totalCompaniesMeetsParisUnknown)}
                </Text>
                <Text variant="small" className="text-gray-400 mt-1">
                  Companies where we cannot determine Paris alignment status
                </Text>
              </div>
            </div>
          </div>

          <div className="bg-black rounded-lg shadow p-6">
            <Text variant="h2" className="mb-4 text-white">
              Emissions Totals (Calculable Companies Only)
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-700 rounded-lg p-4">
                <Text variant="small" className="text-gray-300 mb-1">
                  Total Carbon Budget
                </Text>
                <Text variant="h3" className="font-bold text-white">
                  {formatTonnes(statistics.totalCarbonBudget)} tonnes CO₂
                </Text>
                <Text variant="small" className="text-gray-400 mt-1">
                  Total carbon budget (2025-2050) for calculable companies
                </Text>
              </div>

              <div className="border border-gray-700 rounded-lg p-4">
                <Text variant="small" className="text-gray-300 mb-1">
                  Total Projected Emissions
                </Text>
                <Text variant="h3" className="font-bold text-white">
                  {formatTonnes(statistics.totalProjectedEmissions)} tonnes CO₂
                </Text>
                <Text variant="small" className="text-gray-400 mt-1">
                  Total projected emissions (2025-2050) for calculable companies
                </Text>
              </div>

              <div className="border border-gray-700 rounded-lg p-4">
                <Text variant="small" className="text-gray-300 mb-1">
                  Total Difference from Budget
                </Text>
                <Text
                  variant="h3"
                  className={`font-bold ${
                    statistics.totalTonnesDiffFromBudget >= 0
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {formatTonnes(statistics.totalTonnesDiffFromBudget)} tonnes
                  CO₂
                </Text>
                <Text variant="small" className="text-gray-400 mt-1">
                  Difference: Projected Emissions - Carbon Budget
                  <br />
                  {statistics.totalTonnesDiffFromBudget >= 0
                    ? "(Over budget)"
                    : "(Under budget)"}
                </Text>
              </div>
            </div>
          </div>

          <div className="bg-black rounded-lg p-6 border border-gray-700">
            <Text variant="h3" className="mb-2 text-white">
              Notes
            </Text>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
              <li>
                Statistics are calculated using the same logic as the meets
                Paris calculation in the codebase
              </li>
              <li>
                Only companies with slope data from the API can have their Paris
                alignment calculated
              </li>
              <li>
                Companies with "Unknown" status are excluded from emissions
                totals
              </li>
              <li>
                Carbon budget uses the Carbon Law reduction rate (11.72% annual
                decrease)
              </li>
              <li>
                Projected emissions are calculated from the linear trendline
                based on historical data
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
