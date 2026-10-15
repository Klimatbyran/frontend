import { useState } from "react";
import { useCompanyFilters } from "@/hooks/companies/useCompanyFilters";
import { useSortOptions } from "@/hooks/companies/useCompanySorting";
import {
  PAGE_EXPLORE_COMPANIES_PAGE_SIZE,
  usePageExploreCompanies,
} from "@/hooks/pages/usePageExploreCompanies";

function exploreWindowKey(filters: {
  searchQuery: string;
  sortBy: string;
  sortDirection: string;
  meetsParisFilter: string;
  sectors: string[];
  industryGroups: string[];
}) {
  return [
    filters.searchQuery,
    filters.sortBy,
    filters.sortDirection,
    filters.meetsParisFilter,
    filters.sectors.join(","),
    filters.industryGroups.join(","),
  ].join("\0");
}

/** Full explore list, filtered locally, shown in pages of 12. */
export function useExploreCompaniesData(enabled = true) {
  const list = usePageExploreCompanies(enabled);
  const companyFilters = useCompanyFilters(list.companies, {
    includeSectorFilter: false,
    includeIndustryGroupFilter: true,
  });
  const sortOptions = useSortOptions();
  const windowKey = exploreWindowKey(companyFilters);
  const [windowState, setWindowState] = useState({
    key: windowKey,
    count: PAGE_EXPLORE_COMPANIES_PAGE_SIZE,
  });

  if (windowState.key !== windowKey) {
    setWindowState({
      key: windowKey,
      count: PAGE_EXPLORE_COMPANIES_PAGE_SIZE,
    });
  }

  const visibleCount =
    windowState.key === windowKey
      ? windowState.count
      : PAGE_EXPLORE_COMPANIES_PAGE_SIZE;
  const filtered = companyFilters.filteredCompanies;

  return {
    companyFilters,
    sortOptions,
    companies: filtered.slice(0, visibleCount),
    total: filtered.length,
    loading: list.loading,
    refreshing: list.refreshing,
    fetchingMore: false,
    hasMore: visibleCount < filtered.length,
    loadMore: () => {
      setWindowState({
        key: windowKey,
        count: visibleCount + PAGE_EXPLORE_COMPANIES_PAGE_SIZE,
      });
    },
    error: list.error,
  };
}
