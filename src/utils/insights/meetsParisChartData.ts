import type { CompanyWithKPIs } from "@/types/company";
import { getCompanyUrlSegment } from "@/utils/companyRouting";
import { getBestUnit, type UnitScale } from "@/utils/data/unitScaling";
import { TOP_N } from "@/utils/insights/rankedListUtils";
import { PARIS_STATUS_COLORS } from "@/utils/insights/meetsParisKpi";

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
  "yes",
  "no",
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

/** Emissions totals by Paris status, including unknown — used by the distribution pie. */
export function getParisEmissionsBreakdown(companies: CompanyWithKPIs[]): {
  segments: ParisEmissionsBreakdownSegment[];
  unitScale: UnitScale;
  totalEmissions: number;
} {
  const totals: Record<ParisEmissionsStatus, number> = {
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

    totals[status] += emissions;
    maxEmissions = Math.max(maxEmissions, emissions);
  });

  const segments = PARIS_EMISSIONS_STATUSES.map((status) => ({
    status,
    emissions: totals[status],
  })).filter((segment) => segment.emissions > 0);

  const totalEmissions = segments.reduce(
    (sum, segment) => sum + segment.emissions,
    0,
  );
  const unitScale = getBestUnit(
    Math.max(maxEmissions, totalEmissions),
    "tonnes",
  );

  return { segments, unitScale, totalEmissions };
}

export function buildParisBarChartGroups(
  entries: CompanyParisEmissionsEntry[],
  labels: { no: string; yes: string },
): {
  groups: ParisBarChartGroup[];
  companyById: Map<string, CompanyParisEmissionsEntry>;
  maxBarTotal: number;
} {
  const yesEntries = entries.filter((entry) => entry.meetsParis);
  const noEntries = entries.filter((entry) => !entry.meetsParis);
  const companyById = new Map(
    entries.map((entry) => [getEntryKey(entry), entry]),
  );

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
    companyById,
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
