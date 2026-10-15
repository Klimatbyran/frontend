import { useQuery } from "@tanstack/react-query";
import { getPageExploreCompanies } from "@/lib/pagesApi";
import { PAGES_LIST_PAGE_SIZE, PAGES_QUERY_STALE_TIME } from "./constants";

/** Client-side "show more" step. The API returns the full Swedish list. */
export const PAGE_EXPLORE_COMPANIES_PAGE_SIZE = PAGES_LIST_PAGE_SIZE;

/**
 * One fetch of every Swedish explore card. Filter and sort that array locally;
 * the list is a few hundred companies, and each filter used to repeat the
 * full-list read on the server.
 */
export function usePageExploreCompanies(enabled = true) {
  const query = useQuery({
    queryKey: ["pages", "explore-companies"],
    queryFn: () => getPageExploreCompanies(),
    enabled,
    staleTime: PAGES_QUERY_STALE_TIME,
  });

  return {
    companies: query.data?.items ?? [],
    loading: query.isLoading,
    refreshing: query.isFetching && !query.isLoading,
    error: query.error,
  };
}
