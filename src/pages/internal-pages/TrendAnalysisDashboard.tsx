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
import type { RankedCompany, ReportingPeriodFromList } from "@/types/company";

type CompanyAnalysis = TrendAnalysis & {
  company: RankedCompany;
  scope3DataCount: number;
};

function countScope3Data(company: RankedCompany): number {
  const baseYear = company.baseYear?.year;
  const hasScope3 = (period: ReportingPeriodFromList) =>
    period.emissions?.scope3?.categories &&
    period.emissions.scope3.categories.length > 0;

  if (baseYear) {
    return (
      company.reportingPeriods?.filter(
        (period) =>
          hasScope3(period) &&
          new Date(period.endDate).getFullYear() >= baseYear,
      ).length || 0
    );
  }
  return (
    company.reportingPeriods?.filter((period) => hasScope3(period)).length || 0
  );
}

function getEmissionsDataSinceBaseYear(company: RankedCompany) {
  const baseYear = company.baseYear?.year;
  const data =
    company.reportingPeriods?.filter(
      (period) =>
        period.emissions &&
        period.emissions.calculatedTotalEmissions !== null &&
        period.emissions.calculatedTotalEmissions !== undefined,
    ) || [];
  return baseYear
    ? data.filter(
        (period) => new Date(period.endDate).getFullYear() >= baseYear,
      )
    : data;
}

function buildCompanyAnalysis(company: RankedCompany): CompanyAnalysis {
  const trendAnalysis = calculateTrendline(company);
  const scope3DataCount = countScope3Data(company);

  if (trendAnalysis) {
    return { ...trendAnalysis, scope3DataCount, company };
  }

  const dataSinceBaseYear = getEmissionsDataSinceBaseYear(company);
  return {
    method: "none",
    explanation: "No trendline available",
    explanationParams: {},
    coefficients: undefined,
    cleanDataPoints: dataSinceBaseYear.length,
    trendDirection: "stable",
    yearlyPercentageChange: 0,
    scope3DataCount,
    company,
  };
}

function filterAndSortAnalyses(
  analyses: CompanyAnalysis[],
  searchTerm: string,
  sortBy: string,
  sortOrder: "asc" | "desc",
): CompanyAnalysis[] {
  return analyses
    .filter((analysis) =>
      analysis.company.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      let aValue: string | number = a[sortBy as keyof TrendAnalysis] as
        | string
        | number;
      let bValue: string | number = b[sortBy as keyof TrendAnalysis] as
        | string
        | number;

      if (sortBy === "companyName") {
        aValue = a.company.name.toLowerCase();
        bValue = b.company.name.toLowerCase();
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
}

function computeSummaryMetrics(filteredCompanies: CompanyAnalysis[]) {
  const countDataPoints = (analysis: CompanyAnalysis) =>
    analysis.company.reportingPeriods?.filter(
      (period: ReportingPeriodFromList) =>
        period.emissions &&
        period.emissions.calculatedTotalEmissions !== null &&
        period.emissions.calculatedTotalEmissions !== undefined,
    ).length || 0;

  const avgDataPoints =
    filteredCompanies.reduce(
      (sum, analysis) => sum + countDataPoints(analysis),
      0,
    ) / filteredCompanies.length || 0;

  const avgCleanDataPoints =
    filteredCompanies.reduce(
      (sum, analysis) =>
        sum + getEmissionsDataSinceBaseYear(analysis.company).length,
      0,
    ) / filteredCompanies.length || 0;

  return {
    avgDataPoints,
    avgCleanDataPoints,
    decreasingTrendCount: filteredCompanies.filter(
      (a) => a.trendDirection === "decreasing",
    ).length,
    increasingTrendCount: filteredCompanies.filter(
      (a) => a.trendDirection === "increasing",
    ).length,
    noTrendCount: filteredCompanies.filter((a) => a.method === "none").length,
    meetsCarbonLawCount: filteredCompanies.filter(
      (a) => a.yearlyPercentageChange < -11,
    ).length,
    meetsParisCount: filteredCompanies.filter((analysis) => {
      const trendAnalysis = analysis.method !== "none" ? analysis : null;
      return calculateMeetsParis(analysis.company, trendAnalysis);
    }).length,
  };
}

function useTrendAnalyses(companies: RankedCompany[] | undefined) {
  const [originalAnalyses, setOriginalAnalyses] = useState<CompanyAnalysis[]>(
    [],
  );

  useEffect(() => {
    if (!companies) return;
    setOriginalAnalyses(companies.map(buildCompanyAnalysis));
  }, [companies]);

  return originalAnalyses;
}

function TrendAnalysisContent({
  filteredCompanies,
  searchTerm,
  setSearchTerm,
  sortBy,
  sortOrder,
  onSort,
  onCompanyClick,
}: {
  filteredCompanies: CompanyAnalysis[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (column: string) => void;
  onCompanyClick: (companyId: string) => void;
}) {
  const metrics = computeSummaryMetrics(filteredCompanies);

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Trend Analysis Dashboard"
        description="Internal analysis of all companies - showing which have trend projections and which don't"
      />

      <TrendAnalysisSummaryCards
        totalCompanies={filteredCompanies.length}
        {...metrics}
      />

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
        onSort={onSort}
        onCompanyClick={onCompanyClick}
      />
    </div>
  );
}

export function TrendAnalysisDashboard() {
  const { companies, companiesLoading, companiesError } = useCompanies();
  const { currentLanguage } = useLanguage();
  const originalAnalyses = useTrendAnalyses(companies);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyAnalysis[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("companyName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    if (!originalAnalyses.length) return;
    setFilteredCompanies(
      filterAndSortAnalyses(originalAnalyses, searchTerm, sortBy, sortOrder),
    );
  }, [originalAnalyses, searchTerm, sortBy, sortOrder]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleCompanyClick = (companyId: string) => {
    const basePath = currentLanguage === "sv" ? "/sv" : "/en";
    const url = `${window.location.origin}${basePath}/companies/${companyId}`;
    window.open(url, "_blank");
  };

  if (companiesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Text variant="h1">Loading trend analysis...</Text>
      </div>
    );
  }

  if (companiesError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Text variant="h1" className="text-red-500">
          Error loading data: {companiesError.toString()}
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
      <TrendAnalysisContent
        filteredCompanies={filteredCompanies}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onCompanyClick={handleCompanyClick}
      />
    </>
  );
}
