import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ExternalLink } from "lucide-react";
import { getTrendIcon } from "@/utils/ui/trends";
import { SortableTableHeader } from "@/components/layout/SortableTableHeader";
import type { TrendAnalysis } from "@/lib/calculations/trends/types";

interface TrendAnalysisCompaniesTableProps {
  companies: TrendAnalysis[];
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
    <Card>
      <CardHeader>
        <CardTitle>Company Trend Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto relative">
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
                  column="method"
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
              {companies.map((company) => (
                <TableRow key={company.companyId}>
                  {/* Company Name */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onCompanyClick(company.companyId)}
                        className="text-left hover:text-blue-400 hover:underline transition-colors duration-200 flex items-center gap-1"
                      >
                        <Text variant="body" className="font-medium">
                          {company.companyName}
                        </Text>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </button>
                    </div>
                  </TableCell>

                  {/* Base Year */}
                  <TableCell>
                    {company.baseYear !== undefined && company.baseYear !== null
                      ? company.baseYear.toString()
                      : "N/A"}
                  </TableCell>

                  {/* Total Data Points */}
                  <TableCell>{company.originalDataPoints}</TableCell>

                  {/* Data Since Base Year */}
                  <TableCell>{company.cleanDataPoints}</TableCell>

                  {/* Scope 3 Data Count */}
                  <TableCell>{(company as any).scope3DataCount || 0}</TableCell>

                  {/* Trend */}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {company.method === "none" ? (
                        <Text variant="small" className="text-grey">
                          No Trend
                        </Text>
                      ) : (
                        <>
                          {getTrendIcon(company.trendDirection)}
                          <Text variant="small">{company.trendDirection}</Text>
                        </>
                      )}
                    </div>
                  </TableCell>

                  {/* Slope / Yearly % Change */}
                  <TableCell>
                    {company.method === "none" ? (
                      <span className="text-grey">N/A</span>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-xs text-grey">
                          Slope:{" "}
                          {company.coefficients
                            ? "slope" in company.coefficients
                              ? `${company.coefficients.slope.toFixed(2)} tCO₂e/year`
                              : `${company.coefficients.a.toFixed(2)} tCO₂e/year`
                            : "N/A"}
                        </div>
                        <div
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
                        </div>
                      </div>
                    )}
                  </TableCell>

                  {/* Unusual Points */}
                  <TableCell>
                    {company.unusualPointsCount > 0 ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="inline-flex">
                            <Badge
                              variant="destructive"
                              className="cursor-pointer hover:bg-pink-5 transition-colors"
                            >
                              {company.unusualPointsCount}
                            </Badge>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-96 max-h-64 overflow-y-auto bg-black-2 border border-grey/30 shadow-lg z-50"
                          side="top"
                          align="start"
                        >
                          <div className="space-y-3">
                            <h4 className="font-medium text-white mb-2">
                              Unusual Points Detected
                            </h4>
                            <div className="text-xs text-grey mb-3 pb-2 border-b border-grey/20">
                              Threshold: 4x median year-over-year change + 50%
                              absolute change
                            </div>
                            {company.excludedData?.unusualPoints &&
                            company.excludedData.unusualPoints.length > 0 ? (
                              company.excludedData.unusualPoints.map(
                                (point, index) => (
                                  <div
                                    key={index}
                                    className="text-sm border-b border-grey/20 pb-2 last:border-b-0"
                                  >
                                    <div className="font-medium text-white mb-1">
                                      Year {point.year}
                                    </div>
                                    <div className="text-grey text-xs space-y-1">
                                      <div className="bg-grey/10 p-2 rounded mb-2">
                                        <span className="font-medium">
                                          Emissions:
                                        </span>{" "}
                                        {point.value.toLocaleString()} tCO₂e
                                      </div>
                                      <div className="text-pink-3 leading-relaxed">
                                        {point.details}
                                      </div>
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
                      <Badge variant="secondary">0</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
