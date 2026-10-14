import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import {
  getPageCompaniesOverview,
  getPageCompaniesOverviewSummary,
} from "@/lib/pagesApi";
import type {
  PageCompaniesOverviewQuery,
  PageCompanyOverviewItem,
} from "@/types/pages";
import { isInfiniteListRefreshing } from "./infiniteListQueryState";

const STALE_TIME = 1_800_000;

/** Matches API `PAGE_OVERVIEW_DEFAULT_PAGE_SIZE` and the table "show more" step. */
export const PAGE_OVERVIEW_PAGE_SIZE = 12;

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

  const query = useInfiniteQuery({
    queryKey: [
      "pages",
      "companies-overview",
      sector ?? "all",
      q ?? "",
      sortBy,
      sortDir,
    ],
    queryFn: ({ pageParam }) =>
      getPageCompaniesOverview({
        sector: sector ?? undefined,
        q,
        sortBy,
        sortDir,
        page: pageParam,
        pageSize: PAGE_OVERVIEW_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: options?.enabled ?? true,
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  });

  const companies = (query.data?.pages.flatMap((page) => page.items) ??
    []) as PageCompanyOverviewItem[];
  const total = query.data?.pages[0]?.total ?? 0;

  const refreshing = isInfiniteListRefreshing(
    query.isFetching,
    query.isFetchingNextPage,
  );

  return {
    companies,
    total,
    loading: query.isLoading,
    refreshing,
    fetchingMore: query.isFetchingNextPage,
    hasMore: Boolean(query.hasNextPage),
    loadMore: () => {
      void query.fetchNextPage();
    },
    error: query.error,
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
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
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
