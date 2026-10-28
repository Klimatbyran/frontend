export type ScopeKey = "scope1" | "scope2" | "scope3";
export type GuideTab = "overview" | ScopeKey;
export type EmissionsGroupKey = "own" | "valueChain";

export type Scope3CategoryDriver = {
  category: number;
  total: number;
  shareOfScope3: number | null;
};

export type UnderstandingEmissionsInput = {
  year: string;
  total: number | null;
  scope1: number | null;
  scope2: number | null;
  scope3: number | null;
  scope3Categories?: Array<{ category: number; total: number | null }>;
};

export type UnderstandingEmissionsModel = {
  year: string;
  total: number | null;
  scope1: number | null;
  scope2: number | null;
  scope3: number | null;
  own: number | null;
  valueChain: number | null;
  knownScopeSum: number;
  hasOwnData: boolean;
  hasValueChainData: boolean;
  /** True when only one of own / value-chain is reported. */
  isPartialSplit: boolean;
  shares: {
    scope1: number | null;
    scope2: number | null;
    scope3: number | null;
    own: number | null;
    valueChain: number | null;
  };
  /** Scope 1 / 2 shares within the own-operations total (null when own is missing). */
  ownInternalShares: {
    scope1: number | null;
    scope2: number | null;
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

function sumNullable(a: number | null, b: number | null): number | null {
  if (a == null && b == null) return null;
  return (a ?? 0) + (b ?? 0);
}

/** Display share as `<1%` / `>99%` / rounded percent. */
export function formatSharePercentLabel(
  share: number | null,
  options?: { includePercentSign?: boolean },
): string | null {
  if (share == null) return null;
  const includePercentSign = options?.includePercentSign ?? true;
  const pct = share * 100;
  let label: string;
  if (pct > 0 && pct < 1) label = "<1";
  else if (pct > 99 && pct < 100) label = ">99";
  else label = String(Math.round(pct));
  return includePercentSign ? `${label}%` : label;
}

/**
 * Apply a minimum percentage to each positive share, then renormalize so
 * widths still sum to 100.
 */
export function widthsWithMinimum(
  shares: Array<number | null | undefined>,
  minPercent: number,
): number[] {
  const positives = shares.map((share) =>
    share != null && share > 0 ? share : 0,
  );
  const raw = positives.map((share) =>
    share > 0 ? Math.max(share * 100, minPercent) : 0,
  );
  const sum = raw.reduce((total, value) => total + value, 0);
  if (sum <= 0) return raw;
  if (sum <= 100) return raw;
  return raw.map((value) => (value / sum) * 100);
}

export function buildTopScope3Categories(
  categories: Array<{ category: number; total: number | null }> | undefined,
  scope3Total: number | null,
  limit = 3,
): Scope3CategoryDriver[] {
  const total = scope3Total ?? 0;

  return (categories ?? [])
    .filter((category) => category.total != null && category.total > 0)
    .map((category) => ({
      category: category.category,
      total: category.total as number,
      shareOfScope3: shareOf(category.total, total),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export function buildUnderstandingEmissionsModel(
  input: UnderstandingEmissionsInput,
): UnderstandingEmissionsModel {
  const scope1 = nullIfMissing(input.scope1);
  const scope2 = nullIfMissing(input.scope2);
  const scope3 = nullIfMissing(input.scope3);
  const total = nullIfMissing(input.total);
  const own = sumNullable(scope1, scope2);
  const valueChain = scope3;
  const knownScopeSum = (scope1 ?? 0) + (scope2 ?? 0) + (scope3 ?? 0);
  const shareBase = total && total > 0 ? total : knownScopeSum;
  const ownTotal = own ?? 0;
  const hasOwnData = scope1 != null || scope2 != null;
  const hasValueChainData = scope3 != null;

  return {
    year: input.year,
    total,
    scope1,
    scope2,
    scope3,
    own,
    valueChain,
    knownScopeSum,
    hasOwnData,
    hasValueChainData,
    isPartialSplit: hasOwnData !== hasValueChainData,
    shares: {
      scope1: shareOf(scope1, shareBase),
      scope2: shareOf(scope2, shareBase),
      scope3: shareOf(scope3, shareBase),
      own: shareOf(own, shareBase),
      valueChain: shareOf(valueChain, shareBase),
    },
    ownInternalShares: {
      scope1: shareOf(scope1, ownTotal),
      scope2: shareOf(scope2, ownTotal),
    },
    topScope3Categories: buildTopScope3Categories(
      input.scope3Categories,
      scope3,
    ),
    hasAnyScopeData: hasOwnData || hasValueChainData,
  };
}

/** Scope colors aligned with company emissions charts. */
export const SCOPE_COLORS: Record<ScopeKey, string> = {
  scope1: "var(--pink-3)",
  scope2: "var(--orange-2)",
  scope3: "var(--blue-2)",
};
