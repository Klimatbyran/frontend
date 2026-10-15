import { useQuery } from "@tanstack/react-query";
import {
  getPageCompaniesOverview,
  getPageCompaniesOverviewSummary,
} from "@/lib/pagesApi";
import type {
  PageCompaniesOverviewQuery,
  PageCompanyOverviewItem,
} from "@/types/pages";
import { PAGES_LIST_PAGE_SIZE, PAGES_QUERY_STALE_TIME } from "./constants";
import { usePagesInfiniteList } from "./usePagesInfiniteList";

/**
 * Sector slot in the overview list query key. Sort and search sit after it,
 * so those changes can keep the previous pages; a sector change must not.
 */
const OVERVIEW_LIST_SECTOR_INDEX = 2;

function keepPreviousForSameOverviewSector(sectorKey: string) {
  return <T>(
    previousData: T | undefined,
    previousQuery: { queryKey: readonly unknown[] } | undefined,
  ): T | undefined => {
    if (previousQuery?.queryKey[OVERVIEW_LIST_SECTOR_INDEX] === sectorKey) {
      return previousData;
    }
    return undefined;
  };
}

/** Matches API `PAGE_OVERVIEW_DEFAULT_PAGE_SIZE` and the table "show more" step. */
export const PAGE_OVERVIEW_PAGE_SIZE = PAGES_LIST_PAGE_SIZE;

export type OverviewListSortBy = NonNullable<
  PageCompaniesOverviewQuery["sortBy"]
>;

export function usePageCompaniesOverviewList(options?: {
  sector?: string | null;
  q?: string;
  sortBy?: OverviewListSortBy;
  sortDir?: "asc" | "desc";
  enabled?: boolean;
}) {
  const sector = options?.sector ?? null;
  const q = options?.q?.trim() || undefined;
  const sortBy = options?.sortBy ?? "paris";
  const sortDir = options?.sortDir ?? "desc";

  const sectorKey = sector ?? "all";
  const list = usePagesInfiniteList<PageCompanyOverviewItem>({
    queryKey: [
      "pages",
      "companies-overview",
      sectorKey,
      q ?? "",
      sortBy,
      sortDir,
    ],
    queryFn: (page) =>
      getPageCompaniesOverview({
        sector: sector ?? undefined,
        q,
        sortBy,
        sortDir,
        page,
        pageSize: PAGES_LIST_PAGE_SIZE,
      }),
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousForSameOverviewSector(sectorKey),
  });

  return {
    companies: list.items,
    total: list.total,
    loading: list.loading,
    refreshing: list.refreshing,
    fetchingMore: list.fetchingMore,
    hasMore: list.hasMore,
    loadMore: list.loadMore,
    error: list.error,
  };
}

export function usePageCompaniesOverviewSummary(options?: {
  sector?: string | null;
  enabled?: boolean;
}) {
  const sector = options?.sector ?? null;
  const query = useQuery({
    queryKey: ["pages", "companies-overview-summary", sector ?? "all"],
    queryFn: () => getPageCompaniesOverviewSummary(sector),
    enabled: options?.enabled ?? true,
    staleTime: PAGES_QUERY_STALE_TIME,
  });

  return {
    summary: query.data,
    loading: query.isLoading,
    error: query.error,
  };
}

/** Unfiltered summary: industry chips/pie stay comparable after a sector pick. */
export function usePageCompaniesOverviewChrome(options?: {
  enabled?: boolean;
}) {
  return usePageCompaniesOverviewSummary({
    sector: null,
    enabled: options?.enabled,
  });
}
