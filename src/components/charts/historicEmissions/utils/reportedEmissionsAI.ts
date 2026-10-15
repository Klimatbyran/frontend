import type { ChartData, DataPoint } from "@/types/emissions";

/** Chart row fields ChartTooltip uses to decide an emissions AI mark. */
export type ReportedEmissionsAISource = {
  isAIGenerated?: boolean;
  scope1?: { isAIGenerated?: boolean };
  scope2?: { isAIGenerated?: boolean };
  scope3?: { isAIGenerated?: boolean };
  scope3Categories?: Array<{ isAIGenerated?: boolean } | null | undefined>;
};

/**
 * Same rule as the turnover chart tooltip for non-turnover rows:
 * the year is AI-generated when the total is, or any scope or scope 3 category is.
 */
export function isReportedEmissionsAIGenerated(
  source: ReportedEmissionsAISource | null | undefined,
): boolean {
  if (!source) return false;
  if (source.isAIGenerated) return true;
  if (source.scope1?.isAIGenerated) return true;
  if (source.scope2?.isAIGenerated) return true;
  if (source.scope3?.isAIGenerated) return true;
  return (
    source.scope3Categories?.some((category) => category?.isAIGenerated) ??
    false
  );
}

/** Company history point for the two-futures chart, with the AI flag resolved. */
export function toEmissionsHistoryDataPoint(point: ChartData): DataPoint {
  return {
    year: point.year,
    total: point.total,
    trend: point.trend,
    approximated: point.approximated,
    carbonLaw: point.carbonLaw,
    isAIGenerated: isReportedEmissionsAIGenerated(point),
  };
}
