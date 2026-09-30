import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getCompaniesBySearchTerm } from "@/lib/api";
import { HERO_SEARCH_DEBOUNCE_MS } from "@/lib/constants/landingPage";
import { filterSwedishCompanies } from "@/hooks/companies/companyCountryFilterUtils";

export function useCompanySearch(searchQuery: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery.trim());
  /** Start true so consumers can show loading until the first debounce cycle runs. */
  const [isDebouncing, setIsDebouncing] = useState(true);

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
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const results = await getCompaniesBySearchTerm(debouncedQuery);
      return filterSwedishCompanies(results);
    },
    enabled: !!debouncedQuery,
    staleTime: 60 * 1000,
  });

  return {
    searchResults,
    isSearching,
    isDebouncing,
  };
}
