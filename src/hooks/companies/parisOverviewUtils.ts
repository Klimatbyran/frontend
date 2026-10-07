import { SECTOR_ORDER, type SectorCode } from "@/lib/constants/sectors";
import type { CompanyWithKPIs } from "@/types/company";

/**
 * The companies overview is a Sweden page. Geography is carried on companies
 * as a tag slug rather than a field, so the scope is applied by tag.
 */
export const SWEDEN_TAG = "sweden";

export function isSwedishCompany(company: { tags?: string[] }): boolean {
  return (company.tags ?? []).includes(SWEDEN_TAG);
}

export function latestEmissions(company: CompanyWithKPIs): number | null {
  const value =
    company.reportingPeriods?.[0]?.emissions?.calculatedTotalEmissions;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isReducing(company: CompanyWithKPIs): boolean {
  return (
    typeof company.emissionsChangeFromBaseYear === "number" &&
    company.emissionsChangeFromBaseYear < 0
  );
}

export interface ParisSummary {
  total: number;
  onTrack: number;
  offTrack: number;
  /** Companies without enough reported years to judge either way. */
  unknown: number;
  /** Companies whose emissions have fallen at all, on track or not. */
  reducing: number;
  /** Companies not on track that are still cutting emissions. */
  reducingNotOnTrack: number;
  /** On track as a share of every company in view, including the unjudged. */
  onTrackPercent: number;
}

export function summariseParis(companies: CompanyWithKPIs[]): ParisSummary {
  const judged = companies.filter((c) => typeof c.meetsParis === "boolean");
  const onTrack = judged.filter((c) => c.meetsParis === true).length;
  const reducing = companies.filter(isReducing).length;
  const reducingNotOnTrack = companies.filter(
    (c) => c.meetsParis !== true && isReducing(c),
  ).length;

  return {
    total: companies.length,
    onTrack,
    offTrack: judged.length - onTrack,
    unknown: companies.length - judged.length,
    reducing,
    reducingNotOnTrack,
    onTrackPercent: companies.length
      ? Math.round((onTrack / companies.length) * 100)
      : 0,
  };
}

/**
 * The site's pink-to-blue ramp, keyed on the share of an industry's companies
 * that are on track. Blue reads as good everywhere else on the site, so the
 * same direction applies here.
 */
const SHARE_RAMP = [
  "var(--pink-5)",
  "var(--pink-4)",
  "var(--pink-3)",
  "var(--blue-2)",
  "var(--blue-3)",
];
const SHARE_BREAKS = [20, 35, 50, 65];

export function shareRampColor(share: number | null): string {
  if (share === null) return "var(--black-1)";
  let index = 0;
  while (index < SHARE_BREAKS.length && share >= SHARE_BREAKS[index]) index++;
  return SHARE_RAMP[index];
}

export const SHARE_RAMP_STOPS = SHARE_RAMP;

export interface IndustryBreakdownRow {
  code: SectorCode;
  companyCount: number;
  emissions: number;
  /** Share of judged companies on track, or null when none can be judged. */
  onTrackShare: number | null;
}

/** Biggest emitter first, so the pie reads clockwise from the top. */
export function buildIndustryBreakdown(
  companies: CompanyWithKPIs[],
): IndustryBreakdownRow[] {
  return SECTOR_ORDER.map((code) => {
    const rows = companies.filter(
      (company) => company.industry?.industryGics?.sectorCode === code,
    );
    const judged = rows.filter((c) => typeof c.meetsParis === "boolean");

    return {
      code,
      companyCount: rows.length,
      emissions: rows.reduce((sum, c) => {
        const value = latestEmissions(c);
        return value === null ? sum : sum + value;
      }, 0),
      onTrackShare: judged.length
        ? (judged.filter((c) => c.meetsParis === true).length / judged.length) *
          100
        : null,
    };
  })
    .filter((row) => row.companyCount > 0)
    .sort((a, b) => b.emissions - a.emissions);
}

/** Deepest cutters that are also on track, so a big cut by a company still
 * overshooting its budget isn't presented as a success story. */
export function fastestCutters(
  companies: CompanyWithKPIs[],
  limit = 5,
): CompanyWithKPIs[] {
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
  /** At least {@link TREND_MIN_YEARS} distinct years with an emissions total. */
  enough: number;
  /** Fewer than {@link TREND_MIN_YEARS} years, including no report at all. */
  tooLittle: number;
}

/** Distinct years that include a numeric emissions total. */
export function reportedEmissionYears(company: {
  reportingPeriods?: Array<{
    endDate?: string | null;
    emissions?: { calculatedTotalEmissions?: number | null } | null;
  }> | null;
}): number {
  const years = new Set<string>();
  let undated = 0;

  for (const period of company.reportingPeriods ?? []) {
    const value = period.emissions?.calculatedTotalEmissions;
    if (typeof value !== "number" || !Number.isFinite(value)) continue;

    if (period.endDate) {
      const year = new Date(period.endDate).getUTCFullYear();
      if (Number.isFinite(year)) {
        years.add(String(year));
        continue;
      }
    }

    undated += 1;
  }

  return years.size + undated;
}

/** Enough years to read a trend, against everyone else in view. */
export function summariseReporting(
  companies: Array<Parameters<typeof reportedEmissionYears>[0]>,
): ReportingSplit {
  let enough = 0;

  for (const company of companies) {
    if (reportedEmissionYears(company) >= TREND_MIN_YEARS) enough += 1;
  }

  const total = companies.length;
  return { total, enough, tooLittle: total - enough };
}

/** Off track, worst first: still growing, or shrinking far too slowly. */
export function furthestBehind(
  companies: CompanyWithKPIs[],
  limit = 5,
): CompanyWithKPIs[] {
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
