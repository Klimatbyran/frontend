import type { ListCardProps } from "@/components/explore/ListCard";

export type ComparisonEntityVariant = NonNullable<ListCardProps["variant"]>;

export const COMPARISON_MIN = 2;
export const COMPARISON_MAX = 4;

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
