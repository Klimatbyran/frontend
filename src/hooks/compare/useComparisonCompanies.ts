import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  getPageCompanyEmissionsHistory,
  getPageCompanyHeader,
  getPageCompanyOverview,
} from "@/lib/pagesApi";
import type { PageExploreCompany } from "@/types/pages";
import { PAGES_QUERY_STALE_TIME } from "@/hooks/pages/constants";
import { exploreCompanyFromPageDetail } from "@/utils/pages/exploreCompanyFromPageDetail";

type ComparisonCompanyQueryState = {
  isError: boolean;
  error: unknown;
  isPending: boolean;
  isFetching: boolean;
};

export function getComparisonCompaniesFetchError(
  enabled: boolean,
  segmentCount: number,
  companiesCount: number,
  queries: ComparisonCompanyQueryState[],
): Error | null {
  if (!enabled || segmentCount === 0) {
    return null;
  }

  const errored = queries.find((query) => query.isError);
  if (errored?.error != null) {
    return errored.error instanceof Error
      ? errored.error
      : new Error(String(errored.error));
  }

  const pending = queries.some((query) => query.isPending || query.isFetching);
  if (!pending && companiesCount < segmentCount) {
    return new Error("Failed to load one or more companies for comparison");
  }

  return null;
}

/** `/companies/:segment` (optional language prefix). */
export function getCompanySegmentFromComparisonLink(
  linkTo: string,
): string | null {
  const match = linkTo.match(/\/companies\/([^/?#]+)/i);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

/**
 * Load only the selected comparison companies (2–4) via page detail endpoints,
 * instead of downloading the full explore list.
 */
export function useComparisonCompanies(
  selectedLinkTos: string[],
  enabled: boolean,
) {
  const segments = useMemo(() => {
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const linkTo of selectedLinkTos) {
      const segment = getCompanySegmentFromComparisonLink(linkTo);
      if (!segment || seen.has(segment)) continue;
      seen.add(segment);
      unique.push(segment);
    }
    return unique;
  }, [selectedLinkTos]);

  const queries = useQueries({
    queries: segments.map((segment) => ({
      queryKey: ["pages", "comparison-company", segment],
      queryFn: async (): Promise<PageExploreCompany> => {
        const [header, overview, history] = await Promise.all([
          getPageCompanyHeader(segment),
          getPageCompanyOverview(segment),
          getPageCompanyEmissionsHistory(segment),
        ]);
        return exploreCompanyFromPageDetail(header, overview, history);
      },
      enabled: enabled && segments.length > 0,
      staleTime: PAGES_QUERY_STALE_TIME,
    })),
  });

  const companies = useMemo(
    () =>
      queries
        .map((query) => query.data)
        .filter((company): company is PageExploreCompany => company != null),
    [queries],
  );

  const companiesLoading =
    enabled && segments.length > 0 && queries.some((query) => query.isLoading);

  const companiesError = useMemo(
    () =>
      getComparisonCompaniesFetchError(
        enabled,
        segments.length,
        companies.length,
        queries,
      ),
    [companies.length, enabled, queries, segments.length],
  );

  return {
    companies,
    companiesLoading,
    companiesError,
  };
}
