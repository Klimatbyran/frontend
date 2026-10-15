import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import type { PageListResponse } from "@/types/pages";
import { PAGES_QUERY_STALE_TIME } from "./constants";

/** Fetching page 1 again after sort, search, or filter — not "show more". */
export function isInfiniteListRefreshing(
  isFetching: boolean,
  isFetchingNextPage: boolean,
): boolean {
  return isFetching && !isFetchingNextPage;
}

export function usePagesInfiniteList<T>(options: {
  queryKey: readonly unknown[];
  queryFn: (page: number) => Promise<PageListResponse<T>>;
  enabled?: boolean;
}) {
  const { queryKey, queryFn, enabled = true } = options;

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => queryFn(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled,
    staleTime: PAGES_QUERY_STALE_TIME,
    placeholderData: keepPreviousData,
  });

  const items = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  const refreshing = isInfiniteListRefreshing(
    query.isFetching,
    query.isFetchingNextPage,
  );

  return {
    items,
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
