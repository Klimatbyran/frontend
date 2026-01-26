import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
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
import { useLanguage } from "@/components/LanguageProvider";

export function ParisAlignedStatisticsPage() {
  const { companies, companiesLoading, companiesError } = useCompanies();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();

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

    // Count companies with scope 3 categories data by meets Paris status
    let totalCompaniesMeetsParisYesWithScope3 = 0;
    let totalCompaniesMeetsParisNoWithScope3 = 0;
    let totalCompaniesMeetsParisUnknownWithScope3 = 0;

    // Collect data for companies marked as "Yes"
    const yesCompanies: Array<{
      name: string;
      wikidataId: string;
      emissions2025: number;
      carbonBudget: number;
      projectedEmissions: number;
      diffFromBudget: number;
      hasScope3Categories: boolean;
    }> = [];

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

      // Get 2025 emissions first to check if company should be excluded
      // get2025Emissions checks for actual 2025 data first, then estimates from trendline if not available
      // The trendline is built using the slope from the API, which is calculated from historical data
      const emissions2025 = trendAnalysis
        ? get2025Emissions(company, trendAnalysis)
        : null;

      // Check if company has scope 3 categories data (any year)
      const hasScope3Categories = company.reportingPeriods?.some(
        (period) =>
          period.emissions?.scope3?.categories &&
          period.emissions.scope3.categories.length > 0,
      );

      // Calculate meets Paris status
      // Exclude companies with 0 or negative emissions at 2025 - mark them as Unknown
      let meetsParis: boolean | null = null;
      if (
        trendAnalysis &&
        emissions2025 !== null &&
        emissions2025 !== undefined
      ) {
        if (emissions2025 <= 0) {
          // Company has 0 or negative emissions at 2025 - mark as Unknown
          meetsParis = null;
        } else {
          // Calculate normally for companies with positive emissions
          meetsParis = calculateMeetsParis(company, trendAnalysis);
        }
      }

      if (meetsParis === true) {
        totalCompaniesMeetsParisYes++;
        if (hasScope3Categories) {
          totalCompaniesMeetsParisYesWithScope3++;
        }
      } else if (meetsParis === false) {
        totalCompaniesMeetsParisNo++;
        if (hasScope3Categories) {
          totalCompaniesMeetsParisNoWithScope3++;
        }
      } else {
        // meetsParis === null (unknown)
        totalCompaniesMeetsParisUnknown++;
        if (hasScope3Categories) {
          totalCompaniesMeetsParisUnknownWithScope3++;
        }
      }

      // Only calculate budget/emissions for companies where we can determine Yes/No (not Unknown)
      if (meetsParis !== null && trendAnalysis) {
        totalCompaniesCalculableMeetsParis++;

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

          // Collect data for companies marked as "Yes"
          if (meetsParis === true) {
            const diffFromBudget =
              companyCumulativeEmissions - carbonLawCumulativeEmissions;
            yesCompanies.push({
              name: company.name,
              wikidataId: company.wikidataId,
              emissions2025,
              carbonBudget: carbonLawCumulativeEmissions,
              projectedEmissions: companyCumulativeEmissions,
              diffFromBudget,
              hasScope3Categories,
            });
          }

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
      totalCompaniesMeetsParisYesWithScope3,
      totalCompaniesMeetsParisNoWithScope3,
      totalCompaniesMeetsParisUnknownWithScope3,
      yesCompanies: yesCompanies.sort((a, b) => a.name.localeCompare(b.name)),
    };
  }, [companies]);

  if (companiesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Text variant="h1" className="text-white">
          Loading Paris alignment statistics...
        </Text>
      </div>
    );
  }

  if (companiesError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Text variant="h1" className="text-red-400">
          Error loading data: {companiesError.toString()}
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

  // Export table data to CSV
  const exportToCSV = () => {
    if (!statistics || statistics.yesCompanies.length === 0) return;

    // CSV header
    const headers = [
      "Company Name",
      "Est. 2025 Emissions (tonnes CO₂)",
      "Carbon Budget 2025-2050 (tonnes CO₂)",
      "Projected Emissions 2025-2050 (tonnes CO₂)",
      "Diff from Budget (tonnes CO₂)",
      "Has Scope 3 Categories",
    ];

    // CSV rows
    const rows = statistics.yesCompanies.map((company) => [
      company.name,
      company.emissions2025.toFixed(2),
      company.carbonBudget.toFixed(2),
      company.projectedEmissions.toFixed(2),
      company.diffFromBudget.toFixed(2),
      company.hasScope3Categories ? "Yes" : "No",
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `paris-aligned-companies-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  return (
    <>
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
                <Text variant="small" className="text-gray-500 mt-2">
                  With Scope 3 Categories:{" "}
                  {formatNumber(
                    statistics.totalCompaniesMeetsParisYesWithScope3,
                  )}
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
                <Text variant="small" className="text-gray-500 mt-2">
                  With Scope 3 Categories:{" "}
                  {formatNumber(
                    statistics.totalCompaniesMeetsParisNoWithScope3,
                  )}
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
                <Text variant="small" className="text-gray-500 mt-2">
                  With Scope 3 Categories:{" "}
                  {formatNumber(
                    statistics.totalCompaniesMeetsParisUnknownWithScope3,
                  )}
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
                Companies with 0 or negative emissions at 2025 are marked as
                "Unknown" rather than "Yes" or "No", as we cannot meaningfully
                assess their Paris alignment when they have no emissions
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

          {/* Table of companies marked as "Yes" */}
          {statistics.yesCompanies.length > 0 && (
            <div className="bg-black rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <Text variant="h2" className="text-white">
                  Companies Marked as "Yes" (Meets Paris)
                </Text>
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                  title="Export to CSV"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-sm">Export CSV</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">
                        Company Name
                      </th>
                      <th className="text-right py-3 px-4 text-gray-300 font-semibold">
                        Est. 2025 Emissions
                      </th>
                      <th className="text-right py-3 px-4 text-gray-300 font-semibold">
                        Carbon Budget (2025-2050)
                      </th>
                      <th className="text-right py-3 px-4 text-gray-300 font-semibold">
                        Projected Emissions (2025-2050)
                      </th>
                      <th className="text-right py-3 px-4 text-gray-300 font-semibold">
                        Diff from Budget
                      </th>
                      <th className="text-center py-3 px-4 text-gray-300 font-semibold">
                        Has Scope 3 Categories
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {statistics.yesCompanies.map((company, index) => {
                      const basePath = currentLanguage === "sv" ? "/sv" : "/en";
                      const companyUrl = `${basePath}/companies/${company.wikidataId}`;

                      return (
                        <tr
                          key={index}
                          className="border-b border-gray-800 hover:bg-gray-900 cursor-pointer transition-colors"
                          onClick={() => navigate(companyUrl)}
                        >
                          <td className="py-3 px-4 text-white">
                            {company.name}
                          </td>
                          <td className="py-3 px-4 text-right text-white">
                            {formatTonnes(company.emissions2025)} tonnes CO₂
                          </td>
                          <td className="py-3 px-4 text-right text-white">
                            {formatTonnes(company.carbonBudget)} tonnes CO₂
                          </td>
                          <td className="py-3 px-4 text-right text-white">
                            {formatTonnes(company.projectedEmissions)} tonnes
                            CO₂
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-semibold ${
                              company.diffFromBudget >= 0
                                ? "text-red-400"
                                : "text-green-400"
                            }`}
                          >
                            {formatTonnes(company.diffFromBudget)} tonnes CO₂
                          </td>
                          <td className="py-3 px-4 text-center text-white">
                            {company.hasScope3Categories ? "Yes" : "No"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
