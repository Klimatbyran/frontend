import type { SectorCode } from "@/lib/constants/sectors";
import type { PageCompanyOverviewItem } from "@/types/pages";

/** Shape shared by `/pages/companies-overview` rows and overview UI helpers. */
export type OverviewCompany = Pick<
  PageCompanyOverviewItem,
  | "id"
  | "wikidataId"
  | "name"
  | "sectorCode"
  | "meetsParis"
  | "emissionsChangeFromBaseYear"
  | "latestTotalEmissions"
>;

export function latestEmissions(company: OverviewCompany): number | null {
  const value = company.latestTotalEmissions;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function overviewSectorCode(
  company: OverviewCompany,
): SectorCode | undefined {
  return (company.sectorCode as SectorCode | null) ?? undefined;
}

/**
 * A company trend needs at least this many years with an emissions total.
 * The methodology only draws a trendline from three valid years.
 */
export const TREND_MIN_YEARS = 3;
