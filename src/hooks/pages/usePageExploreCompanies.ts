import { useQuery } from "@tanstack/react-query";
import { getPageExploreCompanies } from "@/lib/pagesApi";
import type { PageExploreCompany } from "@/types/pages";

export function usePageExploreCompanies(options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ["pages", "explore-companies"],
    queryFn: async () => {
      const result = await getPageExploreCompanies();
      return result.items;
    },
    enabled: options?.enabled ?? true,
    staleTime: 1_800_000,
  });

  return {
    companies: (query.data ?? []) as PageExploreCompany[],
    companiesLoading: query.isLoading,
    companiesError: query.error,
  };
}
