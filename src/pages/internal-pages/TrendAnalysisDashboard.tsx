import { useState, useEffect } from "react";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { calculateMeetsParis } from "@/lib/calculations/trends/meetsParis";
import type { TrendAnalysis } from "@/lib/calculations/trends/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSEO } from "@/components/SEO/PageSEO";
import { useLanguage } from "@/components/LanguageProvider";
import { TrendAnalysisSummaryCards } from "@/components/internalDashboards/TrendAnalysisSummaryCards";
import { TrendAnalysisCompaniesTable } from "@/components/internalDashboards/TrendAnalysisCompaniesTable";

export function TrendAnalysisDashboard() {
  const { companies, loading, error } = useCompanies();
  const { currentLanguage } = useLanguage();
  const [originalAnalyses, setOriginalAnalyses] = useState<
    (TrendAnalysis & { company: any; scope3DataCount: number })[]
  >([]);
  const [filteredCompanies, setFilteredCompanies] = useState<
    (TrendAnalysis & { company: any; scope3DataCount: number })[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("companyName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleCompanyClick = (companyId: string) => {
    const basePath = currentLanguage === "sv" ? "/sv" : "/en";
    const url = `${window.location.origin}${basePath}/companies/${companyId}`;
    window.open(url, "_blank");
  };

  // Calculate trend analysis for all companies using API slope
  useEffect(() => {
    if (!companies) return;

    // Show ALL companies for internal analysis (with or without trends)
    const analyses = companies.map((company) => {
      const trendAnalysis = calculateTrendline(company);

      // Calculate scope 3 data count for all companies
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

      // Calculate data since base year for display
      const data =
        company.reportingPeriods?.filter(
          (period) =>
            period.emissions &&
            period.emissions.calculatedTotalEmissions !== null &&
            period.emissions.calculatedTotalEmissions !== undefined,
        ) || [];
      const dataSinceBaseYear = baseYear
        ? data.filter(
            (period) => new Date(period.endDate).getFullYear() >= baseYear,
          )
        : data;

      if (trendAnalysis) {
        // Company has valid trend analysis
        return {
          ...trendAnalysis,
          scope3DataCount,
          company,
        } as TrendAnalysis & { scope3DataCount: number; company: any };
      } else {
        // Company has no trend analysis - show as "no trend" for internal analysis
        return {
          method: "none",
          explanation: "No trendline available",
          explanationParams: {},
          coefficients: undefined,
          cleanDataPoints: dataSinceBaseYear.length,
          trendDirection: "stable" as const,
          yearlyPercentageChange: 0,
          scope3DataCount,
          company,
        } as TrendAnalysis & { scope3DataCount: number; company: any };
      }
    });

    setOriginalAnalyses(analyses);
  }, [companies]);

  // Filter and sort companies
  useEffect(() => {
    if (!originalAnalyses.length) return;

    const filtered = originalAnalyses
      .filter((analysis) => {
        const matchesSearch = analysis.company.name
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

        if (sortBy === "companyName") {
          aValue = a.company.name.toLowerCase();
          bValue = b.company.name.toLowerCase();
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

  // Calculate new summary metrics directly from company data
  const avgDataPoints =
    filteredCompanies.reduce((sum, analysis) => {
      const totalDataPoints =
        analysis.company.reportingPeriods?.filter(
          (period: any) =>
            period.emissions &&
            period.emissions.calculatedTotalEmissions !== null &&
            period.emissions.calculatedTotalEmissions !== undefined,
        ).length || 0;
      return sum + totalDataPoints;
    }, 0) / filteredCompanies.length || 0;

  const avgCleanDataPoints =
    filteredCompanies.reduce((sum, analysis) => {
      const baseYear = analysis.company.baseYear?.year;
      const data =
        analysis.company.reportingPeriods?.filter(
          (period: any) =>
            period.emissions &&
            period.emissions.calculatedTotalEmissions !== null &&
            period.emissions.calculatedTotalEmissions !== undefined,
        ) || [];
      const dataSinceBaseYear = baseYear
        ? data.filter(
            (period: any) => new Date(period.endDate).getFullYear() >= baseYear,
          )
        : data;
      return sum + dataSinceBaseYear.length;
    }, 0) / filteredCompanies.length || 0;

  // Count trend directions
  const decreasingTrendCount = filteredCompanies.filter(
    (analysis) => analysis.trendDirection === "decreasing",
  ).length;
  const increasingTrendCount = filteredCompanies.filter(
    (analysis) => analysis.trendDirection === "increasing",
  ).length;
  const noTrendCount = filteredCompanies.filter(
    (analysis) => analysis.method === "none",
  ).length;

  // Count companies with >11% decreasing emissions (meets Carbon Law)
  const meetsCarbonLawCount = filteredCompanies.filter(
    (analysis) => analysis.yearlyPercentageChange < -11,
  ).length;

  // Count companies that meet Paris Agreement (cumulative emissions 2025-2050)
  const meetsParisCount = filteredCompanies.filter((analysis) => {
    // Use the trend analysis that was already calculated in useEffect
    const trendAnalysis = analysis.method !== "none" ? analysis : null;
    const meetsParis = calculateMeetsParis(analysis.company, trendAnalysis);

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
          description="Internal analysis of all companies - showing which have trend projections and which don't"
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
