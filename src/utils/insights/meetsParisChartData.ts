import type { CompanyWithKPIs } from "@/types/company";
import { getCompanyUrlSegment } from "@/utils/companyRouting";
import { getBestUnit, type UnitScale } from "@/utils/data/unitScaling";
import { TOP_N } from "@/utils/insights/rankedListUtils";
import {
  PARIS_STATUS_COLORS,
  getParisStatusLabels,
} from "@/utils/insights/meetsParisKpi";
import { formatParisEmissionsAmount } from "@/components/companies/rankedList/visualizations/shared/meetsParisEmissionsFormat";
import type { TFunction } from "i18next";

/** Bar chart and ranked lists cap display units at Mt for readability. */
export const PARIS_MT_MAX_DIVISOR = 1_000_000;

export interface CompanyParisEmissionsEntry {
  company: CompanyWithKPIs;
  emissions: number;
  meetsParis: boolean;
}

export type CompanyWithRankedEmissions = CompanyWithKPIs & {
  rankedEmissions: number;
};

export type ParisEmissionsStatus = "yes" | "no" | "unknown";

export interface ParisEmissionsBreakdownSegment {
  status: ParisEmissionsStatus;
  emissions: number;
  companyCount: number;
}

export interface ParisBarChartSegment {
  id: string;
  emissions: number;
  entry: CompanyParisEmissionsEntry | null;
  aggregateCount?: number;
}

export interface ParisBarChartGroup {
  category: string;
  categoryKey: "yes" | "no";
  color: string;
  total: number;
  segments: ParisBarChartSegment[];
}

const PARIS_EMISSIONS_STATUSES: ParisEmissionsStatus[] = [
  "no",
  "yes",
  "unknown",
];

const TOP_EMITTERS_PER_BAR = 10;

function getCompanyEmissionsTonnes(company: CompanyWithKPIs): number | null {
  const emissions =
    company.reportingPeriods?.[0]?.emissions?.calculatedTotalEmissions;
  if (emissions == null || emissions <= 0) {
    return null;
  }
  return emissions;
}

function getParisEmissionsStatus(
  company: CompanyWithKPIs,
): ParisEmissionsStatus | null {
  if (company.meetsParis === true) return "yes";
  if (company.meetsParis === false) return "no";
  if (company.meetsParis === null || company.meetsParis === undefined) {
    return "unknown";
  }
  return null;
}

function getEntryKey(entry: CompanyParisEmissionsEntry): string {
  return getCompanyUrlSegment(entry.company);
}

export function getParisBarChartUnitScale(
  entries: CompanyParisEmissionsEntry[],
): UnitScale {
  const emissionsValues = entries.map((entry) => entry.emissions);
  const max = emissionsValues.length ? Math.max(...emissionsValues) : 0;
  const groupTotals = [
    entries
      .filter((entry) => entry.meetsParis)
      .reduce((sum, entry) => sum + entry.emissions, 0),
    entries
      .filter((entry) => !entry.meetsParis)
      .reduce((sum, entry) => sum + entry.emissions, 0),
  ];
  const maxGroupTotal = Math.max(...groupTotals, max);

  return getBestUnit(maxGroupTotal, "tonnes", {
    maxDivisor: PARIS_MT_MAX_DIVISOR,
  });
}

export function getParisListUnitScale(maxTonnes: number): UnitScale {
  return getBestUnit(maxTonnes, "tonnes", {
    maxDivisor: PARIS_MT_MAX_DIVISOR,
  });
}

/** Known yes/no companies with emissions — used by the bar chart and ranked lists. */
export function getCompanyParisEmissionsData(
  companies: CompanyWithKPIs[],
): CompanyParisEmissionsEntry[] {
  return companies.flatMap((company) => {
    const meetsParis = company.meetsParis;
    if (meetsParis === null || meetsParis === undefined) {
      return [];
    }

    const emissions = getCompanyEmissionsTonnes(company);
    if (emissions == null) {
      return [];
    }

    return [{ company, emissions, meetsParis }];
  });
}

export interface ParisEmissionsBreakdownOptions {
  /** When true, omit companies with unknown Paris alignment. */
  excludeUnknown?: boolean;
}

/** Emissions totals by Paris status — used by Paris overview pie charts. */
export function getParisEmissionsBreakdown(
  companies: CompanyWithKPIs[],
  options: ParisEmissionsBreakdownOptions = {},
): {
  segments: ParisEmissionsBreakdownSegment[];
  unitScale: UnitScale;
  totalEmissions: number;
  totalCompanyCount: number;
} {
  const { excludeUnknown = false } = options;
  const totals: Record<ParisEmissionsStatus, number> = {
    yes: 0,
    no: 0,
    unknown: 0,
  };
  const companyCounts: Record<ParisEmissionsStatus, number> = {
    yes: 0,
    no: 0,
    unknown: 0,
  };

  let maxEmissions = 0;

  companies.forEach((company) => {
    const emissions = getCompanyEmissionsTonnes(company);
    if (emissions == null) return;

    const status = getParisEmissionsStatus(company);
    if (!status) return;
    if (excludeUnknown && status === "unknown") return;

    totals[status] += emissions;
    companyCounts[status] += 1;
    maxEmissions = Math.max(maxEmissions, emissions);
  });

  const statuses = excludeUnknown
    ? PARIS_EMISSIONS_STATUSES.filter((status) => status !== "unknown")
    : PARIS_EMISSIONS_STATUSES;

  const segments = statuses
    .map((status) => ({
      status,
      emissions: totals[status],
      companyCount: companyCounts[status],
    }))
    .filter((segment) => segment.emissions > 0);

  const totalEmissions = segments.reduce(
    (sum, segment) => sum + segment.emissions,
    0,
  );
  const totalCompanyCount = segments.reduce(
    (sum, segment) => sum + segment.companyCount,
    0,
  );
  const unitScale = getBestUnit(
    Math.max(maxEmissions, totalEmissions),
    "tonnes",
  );

  return { segments, unitScale, totalEmissions, totalCompanyCount };
}

export interface ParisEmissionsDistributionStat {
  count: number;
  colorClass: string;
  label: string;
  displayValue: string;
  secondaryDisplayValue?: string;
}

/** Emissions breakdown stats for the Paris stats panel (yes/no only, in tonnes). */
export function getParisEmissionsDistributionStats(
  companies: CompanyWithKPIs[],
  t: TFunction,
): ParisEmissionsDistributionStat[] {
  const { segments, unitScale } = getParisEmissionsBreakdown(companies, {
    excludeUnknown: true,
  });
  const statusLabels = getParisStatusLabels(t);
  const entityPlural = t("header.companies").toLowerCase();
  const colorClassByStatus = {
    yes: "text-blue-3",
    no: "text-pink-3",
  } as const;

  return segments
    .filter(
      (
        segment,
      ): segment is ParisEmissionsBreakdownSegment & {
        status: "yes" | "no";
      } => segment.status === "yes" || segment.status === "no",
    )
    .map((segment) => ({
      count: segment.emissions,
      colorClass: colorClassByStatus[segment.status],
      label: statusLabels[segment.status],
      displayValue: formatParisEmissionsAmount(segment.emissions, unitScale, t),
      secondaryDisplayValue: `${segment.companyCount} ${entityPlural}`,
    }));
}

export function buildParisBarChartGroups(
  entries: CompanyParisEmissionsEntry[],
  labels: { no: string; yes: string },
): {
  groups: ParisBarChartGroup[];
  maxBarTotal: number;
} {
  const yesEntries = entries.filter((entry) => entry.meetsParis);
  const noEntries = entries.filter((entry) => !entry.meetsParis);

  const buildGroup = (
    category: string,
    categoryKey: "yes" | "no",
    color: string,
    groupEntries: CompanyParisEmissionsEntry[],
  ): ParisBarChartGroup => {
    const sortedDesc = [...groupEntries].sort(
      (a, b) => b.emissions - a.emissions,
    );
    const topEntries = sortedDesc.slice(0, TOP_EMITTERS_PER_BAR);
    const remainingEntries = sortedDesc.slice(TOP_EMITTERS_PER_BAR);

    const individualSegments: ParisBarChartSegment[] = topEntries.map(
      (entry) => ({
        id: getEntryKey(entry),
        entry,
        emissions: entry.emissions,
      }),
    );

    const otherSegment: ParisBarChartSegment | null =
      remainingEntries.length > 0
        ? {
            id: `other-${categoryKey}`,
            entry: null,
            emissions: remainingEntries.reduce(
              (sum, entry) => sum + entry.emissions,
              0,
            ),
            aggregateCount: remainingEntries.length,
          }
        : null;

    const segments = otherSegment
      ? [...individualSegments, otherSegment]
      : individualSegments;

    return {
      category,
      categoryKey,
      color,
      total: groupEntries.reduce((sum, entry) => sum + entry.emissions, 0),
      segments,
    };
  };

  const groups = [
    buildGroup(labels.no, "no", PARIS_STATUS_COLORS.no, noEntries),
    buildGroup(labels.yes, "yes", PARIS_STATUS_COLORS.yes, yesEntries),
  ];

  return {
    groups,
    maxBarTotal: Math.max(...groups.map((group) => group.total), 0),
  };
}

export function getTopParisEmissionsCompanies(
  companies: CompanyWithKPIs[],
  meetsParis: boolean,
  limit = TOP_N,
): { entities: CompanyWithRankedEmissions[]; unitScale: UnitScale } {
  const entries = getCompanyParisEmissionsData(companies);
  const filtered = entries
    .filter((entry) => entry.meetsParis === meetsParis)
    .sort((a, b) => b.emissions - a.emissions);

  const maxEmissions = entries.length
    ? Math.max(...entries.map((entry) => entry.emissions))
    : 0;
  const unitScale = getParisListUnitScale(maxEmissions);

  const entities = filtered.slice(0, limit).map(({ company, emissions }) => ({
    ...company,
    rankedEmissions: emissions / unitScale.divisor,
  }));

  return { entities, unitScale };
}

/** Max ranked emissions across both Paris insight lists for shared bar scaling. */
export function getParisEmitterListsBarMax(
  companies: CompanyWithKPIs[],
  limit = TOP_N,
): number {
  const missingParis = getTopParisEmissionsCompanies(companies, false, limit);
  const meetingParis = getTopParisEmissionsCompanies(companies, true, limit);
  const rankedValues = [
    ...missingParis.entities.map((entity) => entity.rankedEmissions),
    ...meetingParis.entities.map((entity) => entity.rankedEmissions),
  ];

  return rankedValues.length ? Math.max(...rankedValues) : 1;
}
