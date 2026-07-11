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

export function getCompanyParisEmissionsData(
  companies: CompanyWithKPIs[],
): CompanyParisEmissionsEntry[] {
  return companies.flatMap((company) => {
    const meetsParis = company.meetsParis;
    if (meetsParis === null || meetsParis === undefined) {
      return [];
    }

    const emissions =
      company.reportingPeriods?.[0]?.emissions?.calculatedTotalEmissions;
    if (emissions == null || emissions <= 0) {
      return [];
    }

    return [{ company, emissions, meetsParis }];
  });
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
