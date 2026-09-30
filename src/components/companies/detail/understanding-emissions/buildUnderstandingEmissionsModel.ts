import type { Emissions, ReportingPeriod } from "@/types/company";

export type ScopeKey = "scope1" | "scope2" | "scope3";
export type GuideTab = "overview" | ScopeKey;

export type Scope3CategoryDriver = {
  category: number;
  total: number;
  shareOfScope3: number | null;
};

export type UnderstandingEmissionsModel = {
  year: string;
  total: number | null;
  scope1: number | null;
  scope2: number | null;
  scope3: number | null;
  knownScopeSum: number;
  shares: {
    scope1: number | null;
    scope2: number | null;
    scope3: number | null;
  };
  topScope3Categories: Scope3CategoryDriver[];
  hasAnyScopeData: boolean;
};

function nullIfMissing(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(value)) return null;
  return value;
}

function shareOf(part: number | null, whole: number): number | null {
  if (part == null || whole <= 0) return null;
  return part / whole;
}

export function getScopeValues(emissions: Emissions | null | undefined): {
  scope1: number | null;
  scope2: number | null;
  scope3: number | null;
  total: number | null;
} {
  if (!emissions) {
    return { scope1: null, scope2: null, scope3: null, total: null };
  }

  return {
    scope1: nullIfMissing(emissions.scope1?.total),
    scope2: nullIfMissing(emissions.scope2?.calculatedTotalEmissions),
    scope3: nullIfMissing(emissions.scope3?.calculatedTotalEmissions),
    total: nullIfMissing(emissions.calculatedTotalEmissions),
  };
}

export function buildTopScope3Categories(
  emissions: Emissions | null | undefined,
  limit = 3,
): Scope3CategoryDriver[] {
  const categories = emissions?.scope3?.categories ?? [];
  const scope3Total =
    nullIfMissing(emissions?.scope3?.calculatedTotalEmissions) ?? 0;

  return categories
    .filter((category) => category.total != null && category.total > 0)
    .map((category) => ({
      category: category.category,
      total: category.total as number,
      shareOfScope3: shareOf(category.total as number, scope3Total),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export function buildUnderstandingEmissionsModel(
  period: ReportingPeriod,
  year: string,
): UnderstandingEmissionsModel {
  const { scope1, scope2, scope3, total } = getScopeValues(period.emissions);
  const knownScopeSum =
    (scope1 ?? 0) + (scope2 ?? 0) + (scope3 ?? 0);
  const shareBase = total && total > 0 ? total : knownScopeSum;

  return {
    year,
    total,
    scope1,
    scope2,
    scope3,
    knownScopeSum,
    shares: {
      scope1: shareOf(scope1, shareBase),
      scope2: shareOf(scope2, shareBase),
      scope3: shareOf(scope3, shareBase),
    },
    topScope3Categories: buildTopScope3Categories(period.emissions),
    hasAnyScopeData: scope1 != null || scope2 != null || scope3 != null,
  };
}

export const SCOPE_COLORS: Record<ScopeKey, string> = {
  scope1: "var(--pink-3)",
  scope2: "var(--green-2)",
  scope3: "var(--blue-2)",
};
