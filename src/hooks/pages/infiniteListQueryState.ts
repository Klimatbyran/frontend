/** Fetching page 1 again after sort, search, or filter — not "show more". */
export function isInfiniteListRefreshing(
  isFetching: boolean,
  isFetchingNextPage: boolean,
): boolean {
  return isFetching && !isFetchingNextPage;
}
