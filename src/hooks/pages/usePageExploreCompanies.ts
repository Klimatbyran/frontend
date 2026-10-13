import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getPageExploreCompanies } from "@/lib/pagesApi";
import type {
  PageExploreCompaniesQuery,
  PageExploreCompany,
} from "@/types/pages";

const STALE_TIME = 1_800_000;

/** Matches API explore default page size and the list "show more" step. */
export const PAGE_EXPLORE_COMPANIES_PAGE_SIZE = 12;

export type ExploreListSortBy = NonNullable<
  PageExploreCompaniesQuery["sortBy"]
>;

/**
 * Full unpaginated list for comparison pickers. Omitting page params keeps
 * the API on the single-page full response.
 */
export function usePageExploreCompanies(options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ["pages", "explore-companies", "all"],
    queryFn: async () => {
      const result = await getPageExploreCompanies();
      return result.items;
    },
    enabled: options?.enabled ?? true,
    staleTime: STALE_TIME,
  });

  return {
    companies: (query.data ?? []) as PageExploreCompany[],
    companiesLoading: query.isLoading,
    companiesError: query.error,
  };
}

export function usePageExploreCompaniesList(options?: {
  q?: string;
  sortBy?: ExploreListSortBy;
  sortDir?: "asc" | "desc";
  meetsParis?: "yes" | "no" | "unknown";
  sectors?: string;
  industryGroups?: string;
  countries?: string;
  enabled?: boolean;
}) {
  const q = options?.q?.trim() || undefined;
  const sortBy = options?.sortBy ?? "total_emissions";
  const sortDir = options?.sortDir ?? "desc";
  const meetsParis = options?.meetsParis;
  const sectors = options?.sectors || undefined;
  const industryGroups = options?.industryGroups || undefined;
  const countries = options?.countries || undefined;

  const query = useInfiniteQuery({
    queryKey: [
      "pages",
      "explore-companies",
      q ?? "",
      sortBy,
      sortDir,
      meetsParis ?? "",
      sectors ?? "",
      industryGroups ?? "",
      countries ?? "",
    ],
    queryFn: ({ pageParam }) =>
      getPageExploreCompanies({
        q,
        sortBy,
        sortDir,
        meetsParis,
        sectors,
        industryGroups,
        countries,
        page: pageParam,
        pageSize: PAGE_EXPLORE_COMPANIES_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: options?.enabled ?? true,
    staleTime: STALE_TIME,
  });

  const companies = (query.data?.pages.flatMap((page) => page.items) ??
    []) as PageExploreCompany[];
  const total = query.data?.pages[0]?.total ?? 0;

  return {
    companies,
    total,
    loading: query.isLoading,
    fetchingMore: query.isFetchingNextPage,
    hasMore: Boolean(query.hasNextPage),
    loadMore: () => {
      void query.fetchNextPage();
    },
    error: query.error,
  };
}
