import { SECTOR_ORDER, type SectorCode } from "@/lib/constants/sectors";
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

export interface ParisSummary {
  total: number;
  onTrack: number;
  offTrack: number;
  /** Companies without enough reported years to judge either way. */
  unknown: number;
  /** On track as a share of every company in view, including the unjudged. */
  onTrackPercent: number;
}

export interface ParisDotCompany {
  id: string;
  name: string;
  wikidataId?: string | null;
  onTrack: boolean;
}

/** Judged companies as dots: on track first, then off track, by name. */
export function parisDotCompanies(
  companies: OverviewCompany[],
): ParisDotCompany[] {
  const onTrack: ParisDotCompany[] = [];
  const offTrack: ParisDotCompany[] = [];

  for (const company of companies) {
    if (company.meetsParis !== true && company.meetsParis !== false) continue;
    if (!company.id || !company.name) continue;
    const dot: ParisDotCompany = {
      id: company.id,
      name: company.name,
      wikidataId: company.wikidataId,
      onTrack: company.meetsParis === true,
    };
    if (dot.onTrack) onTrack.push(dot);
    else offTrack.push(dot);
  }

  const byName = (a: ParisDotCompany, b: ParisDotCompany) => {
    const byLabel = a.name.localeCompare(b.name, "sv");
    if (byLabel !== 0) return byLabel;
    return a.id.localeCompare(b.id);
  };

  onTrack.sort(byName);
  offTrack.sort(byName);
  return [...onTrack, ...offTrack];
}

export function summariseParis(companies: OverviewCompany[]): ParisSummary {
  const judged = companies.filter((c) => typeof c.meetsParis === "boolean");
  const onTrack = judged.filter((c) => c.meetsParis === true).length;

  return {
    total: companies.length,
    onTrack,
    offTrack: judged.length - onTrack,
    unknown: companies.length - judged.length,
    onTrackPercent: companies.length
      ? Math.round((onTrack / companies.length) * 100)
      : 0,
  };
}

export interface IndustryBreakdownRow {
  code: SectorCode;
  companyCount: number;
  emissions: number;
}

/** Biggest emitter first, so the pie reads clockwise from the top. */
export function buildIndustryBreakdown(
  companies: OverviewCompany[],
): IndustryBreakdownRow[] {
  return SECTOR_ORDER.map((code) => {
    const rows = companies.filter((company) => company.sectorCode === code);

    return {
      code,
      companyCount: rows.length,
      emissions: rows.reduce((sum, c) => {
        const value = latestEmissions(c);
        return value === null ? sum : sum + value;
      }, 0),
    };
  })
    .filter((row) => row.companyCount > 0)
    .sort((a, b) => b.emissions - a.emissions);
}

/** Deepest cutters that are also on track, so a big cut by a company still
 * overshooting its budget isn't presented as a success story. */
export function fastestCutters(
  companies: OverviewCompany[],
  limit = 5,
): OverviewCompany[] {
  return companies
    .filter(
      (c) =>
        c.meetsParis === true &&
        typeof c.emissionsChangeFromBaseYear === "number",
    )
    .sort(
      (a, b) =>
        (a.emissionsChangeFromBaseYear ?? 0) -
        (b.emissionsChangeFromBaseYear ?? 0),
    )
    .slice(0, limit);
}

/**
 * A company trend needs at least this many years with an emissions total.
 * The methodology only draws a trendline from three valid years.
 */
export const TREND_MIN_YEARS = 3;

export interface ReportingSplit {
  total: number;
  /** A Paris verdict exists, the same signal as the table badge. */
  enough: number;
  /** No verdict, including companies that have not reported. */
  tooLittle: number;
}

/**
 * Enough to judge means the company has a Paris verdict. That is the same
 * split as the on-track and off-track badges, so the bar cannot count a
 * company as readable when the table still says there is no data.
 */
export function summariseReporting(
  companies: Array<{ meetsParis?: boolean | null }>,
): ReportingSplit {
  let enough = 0;

  for (const company of companies) {
    if (typeof company.meetsParis === "boolean") enough += 1;
  }

  const total = companies.length;
  return { total, enough, tooLittle: total - enough };
}

/** Off track, worst first: still growing, or shrinking far too slowly. */
export function furthestBehind(
  companies: OverviewCompany[],
  limit = 5,
): OverviewCompany[] {
  return companies
    .filter(
      (c) =>
        c.meetsParis === false &&
        typeof c.emissionsChangeFromBaseYear === "number",
    )
    .sort(
      (a, b) =>
        (b.emissionsChangeFromBaseYear ?? 0) -
        (a.emissionsChangeFromBaseYear ?? 0),
    )
    .slice(0, limit);
}
