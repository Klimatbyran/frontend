import { useState, useEffect } from "react";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { processCompanyDataWithApiSlope } from "@/lib/calculations/trends/analysis";
import type { TrendAnalysis } from "@/lib/calculations/trends/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSEO } from "@/components/SEO/PageSEO";
import { useLanguage } from "@/components/LanguageProvider";
import { TrendAnalysisSummaryCards } from "@/components/internalDashboards/TrendAnalysisSummaryCards";
import { TrendAnalysisCompaniesTable } from "@/components/internalDashboards/TrendAnalysisCompaniesTable";

export function TrendAnalysisDashboard() {
  const { companies, loading, error } = useCompanies();
  const { currentLanguage } = useLanguage();
  const [originalAnalyses, setOriginalAnalyses] = useState<TrendAnalysis[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<TrendAnalysis[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("companyName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleCompanyClick = (companyId: string) => {
    const basePath = currentLanguage === "sv" ? "/sv" : "/en";
    const url = `${window.location.origin}${basePath}/companies/${companyId}`;
    window.open(url, "_blank");
  };

  // Calculate if company meets Paris Agreement based on cumulative emissions 2025-2050
  const calculateMeetsParis = (
    company: any,
    trendAnalysis: TrendAnalysis | null,
  ): boolean => {
    if (!trendAnalysis || !trendAnalysis.coefficients) return false;

    // Get 2025 emissions (actual or estimated)
    const emissions2025 = get2025Emissions(company, trendAnalysis);
    if (!emissions2025) return false;

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

  // Get 2025 emissions (actual data or estimated from trendline)
  const get2025Emissions = (
    company: any,
    trendAnalysis: TrendAnalysis | null,
  ): number | null => {
    if (!trendAnalysis || !trendAnalysis.coefficients) return null;

    // Check if we have actual 2025 data
    const actual2025Data = company.reportingPeriods?.find(
      (period: any) => new Date(period.endDate).getFullYear() === 2025,
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

  // Calculate cumulative emissions for a linear trendline from startYear to endYear
  const calculateCumulativeEmissions = (
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

  // Calculate cumulative emissions for Carbon Law (11.72% yearly decrease)
  const calculateCarbonLawCumulativeEmissions = (
    startEmissions: number,
    startYear: number,
    endYear: number,
  ): number => {
    let cumulative = 0;
    let currentEmissions = startEmissions;

    for (let year = startYear; year <= endYear; year++) {
      cumulative += currentEmissions;
      currentEmissions *= 1 - 0.1172; // 11.72% yearly decrease
    }
    return cumulative;
  };

  // Calculate trend analysis for all companies using API slope
  useEffect(() => {
    if (!companies) return;
    const analyses = companies.map((company) => {
      const trendAnalysis = processCompanyDataWithApiSlope(company);
      if (trendAnalysis) {
        // Calculate scope 3 data count for companies with trends (since base year with valid scope 3 data)
        const baseYear = company.baseYear?.year;
        const scope3DataCount = baseYear
          ? company.reportingPeriods?.filter(
              (period) =>
                period.emissions?.scope3?.categories &&
                period.emissions.scope3.categories.length > 0 &&
                new Date(period.endDate).getFullYear() >= baseYear,
            ).length || 0
          : company.reportingPeriods?.filter(
              (period) =>
                period.emissions?.scope3?.categories &&
                period.emissions.scope3.categories.length > 0,
            ).length || 0;

        return {
          ...trendAnalysis,
          scope3DataCount,
        } as TrendAnalysis & { scope3DataCount: number };
      } else {
        // Calculate scope 3 data count (since base year with valid scope 3 data)
        const companyBaseYear = company.baseYear?.year;
        const scope3DataCount = companyBaseYear
          ? company.reportingPeriods?.filter(
              (period) =>
                period.emissions?.scope3?.categories &&
                period.emissions.scope3.categories.length > 0 &&
                new Date(period.endDate).getFullYear() >= companyBaseYear,
            ).length || 0
          : company.reportingPeriods?.filter(
              (period) =>
                period.emissions?.scope3?.categories &&
                period.emissions.scope3.categories.length > 0,
            ).length || 0;

        // Calculate total data points (valid emissions data)
        const totalDataPoints =
          company.reportingPeriods?.filter(
            (period) =>
              period.emissions &&
              period.emissions.calculatedTotalEmissions !== null &&
              period.emissions.calculatedTotalEmissions !== undefined,
          ).length || 0;

        // Calculate data since base year
        const dataSinceBaseYearCount = companyBaseYear
          ? company.reportingPeriods?.filter(
              (period) =>
                period.emissions &&
                period.emissions.calculatedTotalEmissions !== null &&
                period.emissions.calculatedTotalEmissions !== undefined &&
                new Date(period.endDate).getFullYear() >= companyBaseYear,
            ).length || 0
          : totalDataPoints;

        // Create a placeholder for companies without trends
        return {
          companyId: company.wikidataId,
          companyName: company.name,
          method: "none",
          explanation: "No trendline available",
          explanationParams: {},
          coefficients: undefined,
          baseYear: company.baseYear?.year,
          excludedData: {
            missingYears: [],
            outliers: [],
            unusualPoints: [],
          },
          issues: [],
          issueCount: 0,
          originalDataPoints: totalDataPoints,
          cleanDataPoints: dataSinceBaseYearCount,
          missingYearsCount: 0,
          outliersCount: 0,
          unusualPointsCount: 0,
          trendDirection: "stable" as const,
          yearlyPercentageChange: 0,
          dataPoints: company.reportingPeriods?.length || 0,
          missingYears: 0,
          hasUnusualPoints: false,
          scope3DataCount,
        } as TrendAnalysis & { scope3DataCount: number };
      }
    });
    setOriginalAnalyses(analyses);
  }, [companies]);

  // Filter and sort companies
  useEffect(() => {
    if (!originalAnalyses.length) return;

    const filtered = originalAnalyses
      .filter((company) => {
        const matchesSearch = company.companyName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => {
        let aValue: any = a[sortBy as keyof TrendAnalysis];
        let bValue: any = b[sortBy as keyof TrendAnalysis];

        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });

    setFilteredCompanies(filtered);
  }, [originalAnalyses, searchTerm, sortBy, sortOrder]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Calculate new summary metrics
  const avgDataPoints =
    filteredCompanies.reduce(
      (sum, company) => sum + company.originalDataPoints,
      0,
    ) / filteredCompanies.length || 0;
  const avgCleanDataPoints =
    filteredCompanies.reduce(
      (sum, company) => sum + company.cleanDataPoints,
      0,
    ) / filteredCompanies.length || 0;

  // Count trend directions
  const decreasingTrendCount = filteredCompanies.filter(
    (company) => company.trendDirection === "decreasing",
  ).length;
  const increasingTrendCount = filteredCompanies.filter(
    (company) => company.trendDirection === "increasing",
  ).length;
  const noTrendCount = filteredCompanies.filter(
    (company) => company.method === "none",
  ).length;

  // Count companies with >11% decreasing emissions (meets Carbon Law)
  const meetsCarbonLawCount = filteredCompanies.filter(
    (company) => company.yearlyPercentageChange < -11,
  ).length;

  // Count companies that meet Paris Agreement (cumulative emissions 2025-2050)
  const meetsParisCount = filteredCompanies.filter((company) => {
    // Use the trend analysis that was already calculated in useEffect
    const trendAnalysis = company.method !== "none" ? company : null;
    const meetsParis = calculateMeetsParis(company, trendAnalysis);

    return meetsParis;
  }).length;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Text variant="h1">Loading trend analysis...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Text variant="h1" className="text-red-500">
          Error loading data: {error.toString()}
        </Text>
      </div>
    );
  }

  return (
    <>
      <PageSEO
        title="Trend Analysis Dashboard - Internal"
        description="Internal dashboard for analyzing trend line choices across companies"
        canonicalUrl="https://klimatkollen.se/internal/trend-analysis"
      />

      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Trend Analysis Dashboard"
          description="Analysis of trend line method selection across all companies"
        />

        <TrendAnalysisSummaryCards
          totalCompanies={filteredCompanies.length}
          avgDataPoints={avgDataPoints}
          avgCleanDataPoints={avgCleanDataPoints}
          decreasingTrendCount={decreasingTrendCount}
          increasingTrendCount={increasingTrendCount}
          noTrendCount={noTrendCount}
          meetsCarbonLawCount={meetsCarbonLawCount}
          meetsParisCount={meetsParisCount}
        />

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-64"
          />
        </div>

        <TrendAnalysisCompaniesTable
          companies={filteredCompanies}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onCompanyClick={handleCompanyClick}
        />
      </div>
    </>
  );
}
