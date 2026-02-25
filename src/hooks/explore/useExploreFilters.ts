import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  isSortDirection,
  type SortDirection,
} from "@/components/explore/SortPopover";
import setOrDeleteSearchParam from "@/utils/data/setOrDeleteSearchParam";
import type { SortOption } from "@/components/explore/SortPopover";

export type MeetsParisFilter = "all" | "yes" | "no";

interface UseExploreFiltersConfig<TSortBy extends string> {
  defaultSortBy: TSortBy;
  isValidSortBy: (value: string) => value is TSortBy;
  sortOptions: readonly SortOption[];
}

export interface UseExploreFiltersResult<TSortBy extends string> {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  meetsParisFilter: MeetsParisFilter;
  setMeetsParisFilter: (value: string) => void;
  sortBy: TSortBy;
  setSortBy: (value: string) => void;
  sortDirection: SortDirection;
  setSortDirection: (value: string) => void;
}

export function useExploreFilters<TSortBy extends string>({
  defaultSortBy,
  isValidSortBy,
  sortOptions,
}: UseExploreFiltersConfig<TSortBy>): UseExploreFiltersResult<TSortBy> {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("searchQuery") || "";

  const meetsParisFilter = ((): MeetsParisFilter => {
    const raw = searchParams.get("meetsParisFilter") ?? "";
    return raw === "yes" || raw === "no" || raw === "all" ? (raw as MeetsParisFilter) : "all";
  })();

  const sortBy = ((): TSortBy => {
    const raw = searchParams.get("sortBy") ?? "";
    return isValidSortBy(raw) ? (raw as TSortBy) : defaultSortBy;
  })();

  const sortDirection = ((): SortDirection => {
    const raw = searchParams.get("sortDirection") ?? "";
    if (isSortDirection(raw)) return raw;
    const fallback =
      sortOptions.find((o) => o.value === sortBy)?.defaultDirection ?? "desc";
    return fallback as SortDirection;
  })();

  const setSearchQuery = useCallback(
    (query: string) =>
      setOrDeleteSearchParam(
        setSearchParams,
        query.trim() || null,
        "searchQuery",
      ),
    [setSearchParams],
  );

  const setMeetsParisFilter = useCallback(
    (value: string) =>
      setOrDeleteSearchParam(setSearchParams, value, "meetsParisFilter"),
    [setSearchParams],
  );

  const setSortBy = useCallback(
    (value: string) =>
      setOrDeleteSearchParam(setSearchParams, value, "sortBy"),
    [setSearchParams],
  );

  const setSortDirection = useCallback(
    (value: string) =>
      setOrDeleteSearchParam(setSearchParams, value, "sortDirection"),
    [setSearchParams],
  );

  return {
    searchQuery,
    setSearchQuery,
    meetsParisFilter,
    setMeetsParisFilter,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
  };
}

