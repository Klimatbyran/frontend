import type { CompanyWithKPIs } from "@/types/company";
import { getBestUnit, type UnitScale } from "@/utils/data/unitScaling";
import { TOP_N } from "@/utils/insights/rankedListUtils";

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

const PARIS_EMISSIONS_STATUSES: ParisEmissionsStatus[] = [
  "yes",
  "no",
  "unknown",
];

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
    { maxDivisor: 1_000_000 },
  );

  return { segments, unitScale, totalEmissions };
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
  const unitScale = getBestUnit(maxEmissions, "tonnes", {
    maxDivisor: 1_000_000,
  });

  const entities = filtered.slice(0, limit).map(({ company, emissions }) => ({
    ...company,
    rankedEmissions: emissions / unitScale.divisor,
  }));

  return { entities, unitScale };
}
