import { useEffect, useState } from "react";
import { useCompanyFilters } from "@/hooks/companies/useCompanyFilters";
import { useSortOptions } from "@/hooks/companies/useCompanySorting";
import {
  usePageExploreCompaniesList,
  type ExploreListSortBy,
} from "@/hooks/pages/usePageExploreCompanies";

const SEARCH_DEBOUNCE_MS = 300;

function toApiSortDir(
  direction: "none" | "asc" | "desc",
  sortBy: string,
  sortOptions: ReturnType<typeof useSortOptions>,
): "asc" | "desc" {
  if (direction === "asc" || direction === "desc") return direction;
  return (
    sortOptions.find((option) => option.value === sortBy)?.defaultDirection ??
    "desc"
  );
}

/** Explore companies list, including the URL filters that shape the request. */
export function useExploreCompaniesData(enabled = true) {
  const companyFilters = useCompanyFilters([], {
    includeSectorFilter: false,
    includeIndustryGroupFilter: true,
    serverSide: true,
  });
  const sortOptions = useSortOptions();
  const [debouncedQuery, setDebouncedQuery] = useState(() =>
    companyFilters.searchQuery.trim(),
  );

  useEffect(() => {
    const trimmed = companyFilters.searchQuery.trim();
    if (trimmed === debouncedQuery) return;

    const handle = window.setTimeout(() => {
      setDebouncedQuery(trimmed);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [companyFilters.searchQuery, debouncedQuery]);

  const industryGroups = companyFilters.industryGroups.includes("all")
    ? undefined
    : companyFilters.industryGroups.join(",");
  const countries =
    companyFilters.selectedCountries.length > 0
      ? companyFilters.selectedCountries.join(",")
      : undefined;
  const meetsParis =
    companyFilters.meetsParisFilter === "all"
      ? undefined
      : companyFilters.meetsParisFilter;

  const list = usePageExploreCompaniesList({
    q: debouncedQuery,
    sortBy: companyFilters.sortBy as ExploreListSortBy,
    sortDir: toApiSortDir(
      companyFilters.sortDirection,
      companyFilters.sortBy,
      sortOptions,
    ),
    meetsParis,
    industryGroups,
    countries,
    enabled,
  });

  return {
    companyFilters,
    sortOptions,
    ...list,
  };
}
