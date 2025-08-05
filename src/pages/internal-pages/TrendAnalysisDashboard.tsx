import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { processCompanyData } from "@/lib/calculations/trends/analysis";
import { calculateSummaryStats } from "@/lib/calculations/trends/utils";
import type { TrendAnalysis } from "@/lib/calculations/trends/types";
import { ChevronRight } from "lucide-react";
import { getMethodColor } from "@/utils/ui/trends";
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
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("companyName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isMethodSummaryOpen, setIsMethodSummaryOpen] = useState(false);

  const handleCompanyClick = (companyId: string) => {
    const basePath = currentLanguage === "sv" ? "/sv" : "/en";
    const url = `${window.location.origin}${basePath}/companies/${companyId}`;
    window.open(url, "_blank");
  };

  // Calculate trend analysis for all companies
  useEffect(() => {
    if (!companies) return;
    const analyses = companies.map(processCompanyData);
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
        const matchesMethod =
          methodFilter === "all" || company.method === methodFilter;
        return matchesSearch && matchesMethod;
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
  }, [originalAnalyses, searchTerm, methodFilter, sortBy, sortOrder]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const {
    methodCounts,
    avgDataPoints,
    avgCleanDataPoints,
    avgMissingYears,
    outlierPercentage,
  } = calculateSummaryStats(filteredCompanies);

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
          avgMissingYears={avgMissingYears}
          outlierPercentage={outlierPercentage}
        />

        {/* Method Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Method Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(methodCounts).map(([method, count]) => (
                <div key={method} className="text-center">
                  <Badge
                    className={`${getMethodColor(method)} text-white mb-2`}
                  >
                    {method}
                  </Badge>
                  <Text variant="h3">{count}</Text>
                  <Text variant="small" className="text-grey">
                    {((count / filteredCompanies.length) * 100).toFixed(1)}%
                  </Text>
                </div>
              ))}
            </div>

            {/* Method Selection Logic Summary */}
            <Collapsible
              open={isMethodSummaryOpen}
              onOpenChange={setIsMethodSummaryOpen}
              className="mt-6"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-2 h-auto font-medium text-grey hover:text-white"
                >
                  <span>Method Selection Logic</span>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${
                      isMethodSummaryOpen ? "rotate-90" : ""
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-2">
                <div className="text-sm text-grey space-y-1">
                  <div>
                    <strong>No data or insufficient data:</strong> No trendline
                    shown when ≤1 data point available
                  </div>
                  <div>
                    <strong>Insufficient data since base year:</strong> No
                    trendline shown when ≤1 data point since base year
                  </div>
                  <div>
                    <strong>Missing years:</strong> Weighted linear regression
                    for robustness with missing data
                  </div>
                  <div>
                    <strong>Recent stability:</strong> Weighted linear when last
                    4 years are very stable (&lt; 10% std dev)
                  </div>
                  <div>
                    <strong>Unusual points:</strong> Weighted linear when
                    year-over-year changes exceed 4x median
                  </div>
                  <div>
                    <strong>Exponential fit:</strong> Exponential or weighted
                    exponential when R² exponential &gt; R² linear by 0.05
                  </div>
                  <div>
                    <strong>High variance:</strong> Weighted linear when std dev
                    &gt; 20% of mean
                  </div>
                  <div>
                    <strong>Recent exponential patterns:</strong> Recent
                    exponential when last 4 years show strong exponential trend
                  </div>
                  <div>
                    <strong>Default:</strong> Linear regression for well-behaved
                    data
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-64"
          />
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="md:w-48">
              <SelectValue placeholder="Filter by method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="none">No Trendline</SelectItem>
              <SelectItem value="weightedLinear">Weighted Linear</SelectItem>
              <SelectItem value="linear">Linear</SelectItem>
              <SelectItem value="exponential">Exponential</SelectItem>
              <SelectItem value="weightedExponential">
                Weighted Exponential
              </SelectItem>
              <SelectItem value="recentExponential">
                Recent Exponential
              </SelectItem>
              <SelectItem value="simple">Simple</SelectItem>
            </SelectContent>
          </Select>
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
