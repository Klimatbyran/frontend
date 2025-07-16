import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { useCompanies } from "@/hooks/companies/useCompanies";
import {
  selectBestTrendLineMethod,
  calculateMissingYears,
} from "@/utils/companyEmissionsCalculations";
import {
  analyzeTrendCharacteristics,
  calculateTrendDirection,
  detectUnusualEmissionsPoints,
} from "@/lib/calculations/trends/analysis";
import {
  ChevronUp,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSEO } from "@/components/SEO/PageSEO";
import { useLanguage } from "@/components/LanguageProvider";

interface TrendAnalysis {
  companyId: string;
  companyName: string;
  method: string;
  explanation: string;
  baseYear?: number;
  dataPoints: number;
  mean: number;
  stdDev: number;
  variance: number;
  missingYears: number;
  hasUnusualPoints: boolean;
  unusualPointsDetails?: {
    year: number;
    fromYear: number;
    toYear: number;
    fromValue: number;
    toValue: number;
    change: number;
    threshold: number;
    direction: string;
    reason: string;
  }[];
  recentStability: number;
  r2Linear: number;
  r2Exponential: number;
  trendDirection: "increasing" | "decreasing" | "stable" | "insufficient_data";
  trendSlope: number;
  yearlyPercentageChange: number;
  dataRange: { min: number; max: number; span: number };
}

export function TrendAnalysisDashboard() {
  const { t } = useTranslation();
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

    const analyses: TrendAnalysis[] = companies.map((company) => {
      const data = company.reportingPeriods
        .filter(
          (period) =>
            period.emissions &&
            period.emissions.calculatedTotalEmissions !== null &&
            period.emissions.calculatedTotalEmissions !== undefined,
        )
        .map((period) => ({
          year: new Date(period.endDate).getFullYear(),
          total: period.emissions!.calculatedTotalEmissions!,
        }))
        .sort((a, b) => a.year - b.year);

      // Count data points from base year onwards, or total if no base year
      const checkBaseYear = company.baseYear?.year;
      const checkDataSinceBaseYear = checkBaseYear
        ? data.filter((d) => d.year >= checkBaseYear)
        : data;
      const effectiveDataPoints = checkDataSinceBaseYear.length;

      if (effectiveDataPoints < 2) {
        return {
          companyId: company.wikidataId,
          companyName: company.name,
          method: "simple",
          explanation: checkBaseYear
            ? `Simple average slope is used because there are only ${effectiveDataPoints} data points since base year ${checkBaseYear}. More complex methods are unreliable with so little data.`
            : `Simple average slope is used because there are only ${effectiveDataPoints} data points. More complex methods are unreliable with so little data.`,
          baseYear: company.baseYear?.year,
          dataPoints: effectiveDataPoints,
          mean: 0,
          stdDev: 0,
          variance: 0,
          missingYears: 0,
          hasUnusualPoints: false,
          unusualPointsDetails: undefined,
          recentStability: 0,
          r2Linear: 0,
          r2Exponential: 0,
          trendDirection: "insufficient_data" as const,
          trendSlope: 0,
          yearlyPercentageChange: 0,
          dataRange: { min: 0, max: 0, span: 0 },
        };
      }

      // Calculate missing years (base year aware and including zero emissions as missing)
      const baseYear = company.baseYear?.year;
      const dataSinceBaseYear = baseYear
        ? data.filter((d) => d.year >= baseYear)
        : data;

      const missingYears = calculateMissingYears(dataSinceBaseYear, baseYear);

      // Use comprehensive trend analysis utility with base-year filtered data
      const dataPoints = dataSinceBaseYear.map((d) => ({
        year: d.year,
        value: d.total,
      }));
      const analysis = analyzeTrendCharacteristics(dataPoints);

      // Get detailed unusual points information
      const unusualPointsResult = detectUnusualEmissionsPoints(dataPoints);

      // Data range
      const dataRange = {
        min: analysis.statistics.min,
        max: analysis.statistics.max,
        span: analysis.statistics.span,
      };

      // Get trend line method and explanation
      const { method, explanation } = selectBestTrendLineMethod(
        data,
        company.baseYear?.year,
      );

      // Calculate yearly percentage change from trend slope
      const yearlyPercentageChange =
        analysis.statistics.mean > 0
          ? (analysis.trendSlope / analysis.statistics.mean) * 100
          : 0;

      return {
        companyId: company.wikidataId,
        companyName: company.name,
        method,
        explanation,
        baseYear: company.baseYear?.year,
        dataPoints: effectiveDataPoints,
        mean: analysis.statistics.mean,
        stdDev: analysis.statistics.stdDev,
        variance: analysis.statistics.variance,
        missingYears,
        hasUnusualPoints: unusualPointsResult.hasUnusualPoints,
        unusualPointsDetails: unusualPointsResult.details,
        recentStability: analysis.recentStability,
        r2Linear: analysis.r2Linear,
        r2Exponential: analysis.r2Exponential,
        trendDirection: analysis.trendDirection,
        trendSlope: analysis.trendSlope,
        yearlyPercentageChange,
        dataRange,
      };
    });

    setOriginalAnalyses(analyses);
  }, [companies]);

  // Filter and sort companies
  useEffect(() => {
    if (!originalAnalyses.length) return;

    let filtered = originalAnalyses.filter((company) => {
      const matchesSearch = company.companyName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesMethod =
        methodFilter === "all" || company.method === methodFilter;
      return matchesSearch && matchesMethod;
    });

    // Sort
    filtered.sort((a, b) => {
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

  const getMethodColor = (method: string) => {
    switch (method) {
      case "weightedLinear":
        return "bg-blue-4 text-white";
      case "linear":
        return "bg-green-4 text-white";
      case "exponential":
        return "bg-pink-4 text-white";
      case "weightedExponential":
        return "bg-orange-4 text-white";
      case "recentExponential":
        return "bg-purple-4 text-white";
      case "simple":
        return "bg-grey text-white";
      default:
        return "bg-grey text-white";
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "increasing":
        return <TrendingUp className="w-4 h-4 text-pink-3" />;
      case "decreasing":
        return <TrendingDown className="w-4 h-4 text-green-3" />;
      case "stable":
        return <Minus className="w-4 h-4 text-gray-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  // Calculate summary statistics
  const methodCounts = filteredCompanies.reduce(
    (acc, company) => {
      acc[company.method] = (acc[company.method] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const avgDataPoints =
    filteredCompanies.reduce((sum, company) => sum + company.dataPoints, 0) /
    filteredCompanies.length;
  const avgMissingYears =
    filteredCompanies.reduce((sum, company) => sum + company.missingYears, 0) /
    filteredCompanies.length;
  const outlierPercentage =
    (filteredCompanies.filter((c) => c.hasUnusualPoints).length /
      filteredCompanies.length) *
    100;

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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Text variant="h2">{filteredCompanies.length}</Text>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Data Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Text variant="h2">{avgDataPoints.toFixed(1)}</Text>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Missing Years
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Text variant="h2">{avgMissingYears.toFixed(1)}</Text>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                With Unusual Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Text variant="h2">{outlierPercentage.toFixed(1)}%</Text>
            </CardContent>
          </Card>
        </div>

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
                  className="w-full justify-between p-0 h-auto font-medium text-grey hover:text-white"
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
                    <strong>Missing years:</strong> Linear regression for
                    robustness with missing data
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

        {/* Companies Table */}
        <Card>
          <CardHeader>
            <CardTitle>Company Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto relative">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("companyName")}
                        className="p-0 h-auto font-medium"
                      >
                        Company
                        {sortBy === "companyName" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp className="ml-1 w-4 h-4" />
                          ) : (
                            <ChevronDown className="ml-1 w-4 h-4" />
                          ))}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("method")}
                        className="p-0 h-auto font-medium"
                      >
                        Method
                        {sortBy === "method" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp className="ml-1 w-4 h-4" />
                          ) : (
                            <ChevronDown className="ml-1 w-4 h-4" />
                          ))}
                      </Button>
                    </TableHead>
                    <TableHead>Base Year</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("dataPoints")}
                        className="p-0 h-auto font-medium"
                      >
                        Data Points
                        {sortBy === "dataPoints" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp className="ml-1 w-4 h-4" />
                          ) : (
                            <ChevronDown className="ml-1 w-4 h-4" />
                          ))}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("missingYears")}
                        className="p-0 h-auto font-medium"
                      >
                        Missing Years
                        {sortBy === "missingYears" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp className="ml-1 w-4 h-4" />
                          ) : (
                            <ChevronDown className="ml-1 w-4 h-4" />
                          ))}
                      </Button>
                    </TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("yearlyPercentageChange")}
                        className="p-0 h-auto font-medium"
                      >
                        Yearly % Change
                        {sortBy === "yearlyPercentageChange" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp className="ml-1 w-4 h-4" />
                          ) : (
                            <ChevronDown className="ml-1 w-4 h-4" />
                          ))}
                      </Button>
                    </TableHead>
                    <TableHead>R² Linear</TableHead>
                    <TableHead>R² Exp</TableHead>
                    <TableHead>Unusual Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company.companyId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleCompanyClick(company.companyId)
                            }
                            className="text-left hover:text-blue-400 hover:underline transition-colors duration-200 flex items-center gap-1"
                          >
                            <Text variant="body" className="font-medium">
                              {company.companyName}
                            </Text>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="inline-flex">
                              <Badge
                                className={`${getMethodColor(company.method)} text-white cursor-pointer hover:opacity-80 transition-opacity`}
                              >
                                {company.method}
                              </Badge>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-80 max-h-48 overflow-y-auto bg-black-2 border border-grey/30 shadow-lg z-50"
                            side="top"
                            align="start"
                          >
                            <div className="space-y-2">
                              <h4 className="font-medium text-white mb-2">
                                Method Explanation
                              </h4>
                              <p className="text-sm leading-relaxed text-white">
                                {company.explanation}
                              </p>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>
                        {company.baseYear !== undefined &&
                        company.baseYear !== null
                          ? company.baseYear.toString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>{company.dataPoints}</TableCell>
                      <TableCell>{company.missingYears}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(company.trendDirection)}
                          <Text variant="small">{company.trendDirection}</Text>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            company.yearlyPercentageChange > 0
                              ? "text-pink-3"
                              : company.yearlyPercentageChange < 0
                                ? "text-green-3"
                                : "text-grey"
                          }
                        >
                          {company.yearlyPercentageChange > 0 ? "+" : ""}
                          {company.yearlyPercentageChange.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>{company.r2Linear.toFixed(3)}</TableCell>
                      <TableCell>{company.r2Exponential.toFixed(3)}</TableCell>
                      <TableCell>
                        {company.hasUnusualPoints ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="inline-flex">
                                <Badge
                                  variant="destructive"
                                  className="cursor-pointer hover:bg-pink-5 transition-colors"
                                >
                                  Yes
                                </Badge>
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-80 max-h-48 overflow-y-auto bg-black-2 border border-grey/30 shadow-lg z-50"
                              side="top"
                              align="start"
                            >
                              <div className="space-y-2">
                                <h4 className="font-medium text-white mb-2">
                                  Unusual Points Detected
                                </h4>
                                <div className="text-xs text-grey mb-3 pb-2 border-b border-grey/20">
                                  Threshold: 4x median year-over-year change
                                </div>
                                {company.unusualPointsDetails &&
                                company.unusualPointsDetails.length > 0 ? (
                                  company.unusualPointsDetails.map(
                                    (detail, index) => (
                                      <div key={index} className="text-sm">
                                        <div className="text-grey">
                                          <strong>{detail.year}:</strong>{" "}
                                          {detail.reason}
                                        </div>
                                      </div>
                                    ),
                                  )
                                ) : (
                                  <div className="text-sm text-grey">
                                    No details available
                                  </div>
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
