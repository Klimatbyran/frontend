import { useQuery } from "@tanstack/react-query";
import { getPageExploreCompanies } from "@/lib/pagesApi";
import type { PageExploreCompany } from "@/types/pages";

const STALE_TIME = 1_800_000;

/**
 * Full unpaginated list for explore + comparison pickers. Omitting page params
 * keeps the API on the single-page full response. Filter/sort stay client-side
 * until `/pages/explore/companies` honors query filters on stage.
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
