import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink } from "lucide-react";
import { getTrendIcon } from "@/utils/ui/trends";
import { SortableTableHeader } from "@/components/layout/SortableTableHeader";
import type { TrendAnalysis } from "@/lib/calculations/trends/types";

interface TrendAnalysisCompaniesTableProps {
  companies: (TrendAnalysis & { company: any; scope3DataCount: number })[];
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (column: string) => void;
  onCompanyClick: (companyId: string) => void;
}

export function TrendAnalysisCompaniesTable({
  companies,
  sortBy,
  sortOrder,
  onSort,
  onCompanyClick,
}: TrendAnalysisCompaniesTableProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Company Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHeader
                  column="companyName"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={onSort}
                >
                  Company
                </SortableTableHeader>
                <SortableTableHeader
                  column="baseYear"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={onSort}
                >
                  Base Year
                </SortableTableHeader>
                <SortableTableHeader
                  column="originalDataPoints"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={onSort}
                >
                  Total Data Points
                </SortableTableHeader>
                <SortableTableHeader
                  column="cleanDataPoints"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={onSort}
                >
                  Data Since Base Year
                </SortableTableHeader>
                <SortableTableHeader
                  column="scope3DataCount"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={onSort}
                >
                  Scope 3 Data Count
                </SortableTableHeader>
                <SortableTableHeader
                  column="trendDirection"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={onSort}
                >
                  Trend
                </SortableTableHeader>
                <SortableTableHeader
                  column="yearlyPercentageChange"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={onSort}
                >
                  Slope / Yearly % Change
                </SortableTableHeader>
                <SortableTableHeader
                  column="unusualPointsCount"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={onSort}
                >
                  Unusual Points
                </SortableTableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((analysis) => (
                <TableRow key={analysis.company.wikidataId}>
                  {/* Company Name */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          onCompanyClick(analysis.company.wikidataId)
                        }
                        className="text-left hover:text-blue-400 hover:underline transition-colors duration-200 flex items-center gap-1"
                      >
                        <Text variant="body" className="font-medium">
                          {analysis.company.name}
                        </Text>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </button>
                    </div>
                  </TableCell>

                  {/* Base Year */}
                  <TableCell>
                    {analysis.company.baseYear?.year !== undefined &&
                    analysis.company.baseYear?.year !== null
                      ? analysis.company.baseYear.year.toString()
                      : "N/A"}
                  </TableCell>

                  {/* Total Data Points */}
                  <TableCell>
                    {analysis.company.reportingPeriods?.filter(
                      (period: any) =>
                        period.emissions &&
                        period.emissions.calculatedTotalEmissions !== null &&
                        period.emissions.calculatedTotalEmissions !== undefined,
                    ).length || 0}
                  </TableCell>

                  {/* Data Since Base Year */}
                  <TableCell>{analysis.cleanDataPoints}</TableCell>

                  {/* Scope 3 Data Count */}
                  <TableCell>{analysis.scope3DataCount || 0}</TableCell>

                  {/* Trend */}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {analysis.method === "none" ? (
                        <Text variant="small" className="text-grey">
                          No Trend
                        </Text>
                      ) : (
                        <>
                          {getTrendIcon(analysis.trendDirection)}
                          <Text variant="small">{analysis.trendDirection}</Text>
                        </>
                      )}
                    </div>
                  </TableCell>

                  {/* Slope / Yearly % Change */}
                  <TableCell>
                    {analysis.method === "none" ? (
                      <span className="text-grey">N/A</span>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-xs text-grey">
                          Slope:{" "}
                          {analysis.coefficients
                            ? "slope" in analysis.coefficients
                              ? `${analysis.coefficients.slope.toFixed(2)} tCO₂e/year`
                              : `${analysis.coefficients.a.toFixed(2)} tCO₂e/year`
                            : "N/A"}
                        </div>
                        <div
                          className={
                            analysis.yearlyPercentageChange > 0
                              ? "text-pink-3"
                              : analysis.yearlyPercentageChange < 0
                                ? "text-green-3"
                                : "text-grey"
                          }
                        >
                          {analysis.yearlyPercentageChange > 0 ? "+" : ""}
                          {analysis.yearlyPercentageChange.toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </TableCell>

                  {/* Unusual Points */}
                  <TableCell>
                    <span className="text-grey">N/A</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
