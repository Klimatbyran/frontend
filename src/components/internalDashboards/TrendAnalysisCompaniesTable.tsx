import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
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
import { ExternalLink } from "lucide-react";
import { getMethodColor, getTrendIcon } from "@/utils/trend-utils";
import { SortableTableHeader } from "@/components/layout/SortableTableHeader";
import type { TrendAnalysis } from "@/lib/calculations/trends/analysis";

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
                  column="method"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={onSort}
                >
                  Method
                </SortableTableHeader>
                <TableHead>Base Year</TableHead>
                <SortableTableHeader
                  column="dataPoints"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={onSort}
                >
                  Data Points
                </SortableTableHeader>
                <SortableTableHeader
                  column="missingYears"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={onSort}
                >
                  Missing Years
                </SortableTableHeader>
                <TableHead>Trend</TableHead>
                <SortableTableHeader
                  column="yearlyPercentageChange"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={onSort}
                >
                  Yearly % Change
                </SortableTableHeader>
                <TableHead>R² Linear</TableHead>
                <TableHead>R² Exp</TableHead>
                <TableHead>Unusual Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.companyId}>
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
                    {company.baseYear !== undefined && company.baseYear !== null
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
  );
}
