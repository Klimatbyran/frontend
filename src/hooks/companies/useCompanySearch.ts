import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getPageCompaniesSearch } from "@/lib/pagesApi";
import { HERO_SEARCH_DEBOUNCE_MS } from "@/lib/constants/landingPage";

export function useCompanySearch(searchQuery: string) {
  const trimmedQuery = searchQuery.trim();
  const [debouncedQuery, setDebouncedQuery] = useState(trimmedQuery);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    if (trimmedQuery === debouncedQuery) {
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    const handler = setTimeout(() => {
      setDebouncedQuery(trimmedQuery);
      setIsDebouncing(false);
    }, HERO_SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(handler);
    };
  }, [trimmedQuery, debouncedQuery]);

  const { data: searchResults = [], isFetching: isSearching } = useQuery({
    queryKey: ["pageCompanySearch", debouncedQuery],
    queryFn: () =>
      debouncedQuery
        ? getPageCompaniesSearch(debouncedQuery)
        : Promise.resolve([]),
    enabled: !!debouncedQuery,
    staleTime: 60 * 1000,
  });

  return {
    searchResults,
    isSearching,
    isDebouncing,
  };
}
