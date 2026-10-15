import { getPageExploreCompanies } from "@/lib/pagesApi";
import type {
  PageExploreCompaniesQuery,
  PageExploreCompany,
} from "@/types/pages";
import { PAGES_LIST_PAGE_SIZE } from "./constants";
import { usePagesInfiniteList } from "./usePagesInfiniteList";

/** Matches API explore default page size and the list "show more" step. */
export const PAGE_EXPLORE_COMPANIES_PAGE_SIZE = PAGES_LIST_PAGE_SIZE;

export type ExploreListSortBy = NonNullable<
  PageExploreCompaniesQuery["sortBy"]
>;

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

  const list = usePagesInfiniteList<PageExploreCompany>({
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
    queryFn: (page) =>
      getPageExploreCompanies({
        q,
        sortBy,
        sortDir,
        meetsParis,
        industryGroups,
        countries,
        sectors,
        page,
        pageSize: PAGES_LIST_PAGE_SIZE,
      }),
    enabled: options?.enabled ?? true,
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
