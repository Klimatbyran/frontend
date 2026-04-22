import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getCompaniesBySearchTerm } from "@/lib/api";
import { HERO_SEARCH_DEBOUNCE_MS } from "@/lib/constants/landingPage";

export function useCompanySearch(searchQuery: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery.trim());
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    setIsDebouncing(true);
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
      setIsDebouncing(false);
    }, HERO_SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(handler);
      setIsDebouncing(false);
    };
  }, [searchQuery]);

  const { data: searchResults = [], isFetching: isSearching } = useQuery({
    queryKey: ["companySearch", debouncedQuery],
    queryFn: () =>
      debouncedQuery
        ? getCompaniesBySearchTerm(debouncedQuery)
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
