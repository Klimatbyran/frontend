import type { CombinedData } from "@/hooks/useCombinedData";
import type { ListCardProps } from "@/components/explore/ListCard";

export type ComparisonEntityVariant = NonNullable<ListCardProps["variant"]>;

export type ComparisonEntityCategory = Extract<
  CombinedData["category"],
  "companies" | "municipalities" | "regions"
>;

export const COMPARISON_MIN = 2;
export const COMPARISON_MAX = 4;

const COMPARISON_RETURN_TO_KEY = "klimatkollen-comparison-return-to";

export function isCompareRoute(pathname: string): boolean {
  return pathname.includes("/explore/compare");
}

export function buildComparisonReturnTo({
  pathname,
  search = "",
  hash = "",
}: {
  pathname: string;
  search?: string;
  hash?: string;
}): string {
  return `${pathname}${search}${hash}`;
}

export function setComparisonReturnTo(path: string) {
  if (typeof window === "undefined" || isCompareRoute(path)) {
    return;
  }

  sessionStorage.setItem(COMPARISON_RETURN_TO_KEY, path);
}

export function getComparisonReturnTo(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const path = sessionStorage.getItem(COMPARISON_RETURN_TO_KEY);
    return path && !isCompareRoute(path) ? path : null;
  } catch {
    return null;
  }
}

export function clearComparisonReturnTo() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(COMPARISON_RETURN_TO_KEY);
}

/** True when return path points at an entity detail page (not explore list). */
export function isComparisonDetailReturnPath(path: string): boolean {
  return /\/(companies|municipalities|regions)\/[^/?#]+/.test(path);
}

const EXPLORE_PATHS: Record<ComparisonEntityVariant, string> = {
  company: "/explore/companies",
  municipality: "/explore/municipalities",
  region: "/explore/regions",
};

export function buildComparisonLinkTo(
  variant: ComparisonEntityVariant,
  id: string,
): string {
  if (variant === "company") {
    return `/companies/${id}`;
  }
  if (variant === "region") {
    return `/regions/${id.toLowerCase()}`;
  }
  return `/municipalities/${id}`;
}

export function getExplorePath(variant: ComparisonEntityVariant): string {
  return EXPLORE_PATHS[variant];
}

export function isSameComparisonLink(a: string, b: string): boolean {
  return a === b || a.toLowerCase() === b.toLowerCase();
}

export function entityMatchesSelection(
  linkTo: string,
  selectedIds: Iterable<string>,
): boolean {
  for (const selectedId of selectedIds) {
    if (isSameComparisonLink(linkTo, selectedId)) {
      return true;
    }
  }
  return false;
}

/** Returns cards in the order entities were selected. */
export function orderSelectedCards(
  cards: ListCardProps[],
  selectedIds: string[],
): ListCardProps[] {
  return selectedIds
    .map((selectedId) =>
      cards.find((card) => isSameComparisonLink(card.linkTo, selectedId)),
    )
    .filter((card): card is ListCardProps => card !== undefined);
}

export function categoryToVariant(
  category: CombinedData["category"],
): ComparisonEntityVariant | null {
  if (category === "companies") return "company";
  if (category === "municipalities") return "municipality";
  if (category === "regions") return "region";
  return null;
}

export function variantToCategory(
  variant: ComparisonEntityVariant,
): ComparisonEntityCategory {
  if (variant === "company") return "companies";
  if (variant === "municipality") return "municipalities";
  return "regions";
}

export function combinedDataToComparison(item: CombinedData): {
  linkTo: string;
  variant: ComparisonEntityVariant;
} | null {
  const variant = categoryToVariant(item.category);
  if (!variant) {
    return null;
  }

  return {
    linkTo: buildComparisonLinkTo(variant, item.id),
    variant,
  };
}

export function isComparableSearchResult(item: CombinedData): boolean {
  return categoryToVariant(item.category) !== null;
}
