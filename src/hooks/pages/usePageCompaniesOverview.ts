import { useQuery } from "@tanstack/react-query";
import {
  getPageCompaniesOverview,
  getPageCompaniesOverviewSummary,
} from "@/lib/pagesApi";
import type { PageCompanyOverviewItem } from "@/types/pages";

const STALE_TIME = 1_800_000;

export function usePageCompaniesOverviewList(options?: {
  sector?: string | null;
  enabled?: boolean;
}) {
  const sector = options?.sector ?? null;
  const query = useQuery({
    queryKey: ["pages", "companies-overview", sector ?? "all"],
    queryFn: () =>
      getPageCompaniesOverview(sector ? { sector } : {}).then(
        (result) => result.items,
      ),
    enabled: options?.enabled ?? true,
    staleTime: STALE_TIME,
  });

  return {
    companies: (query.data ?? []) as PageCompanyOverviewItem[],
    loading: query.isLoading,
    error: query.error,
  };
}

export function usePageCompaniesOverviewSummary(options?: {
  sector?: string | null;
  enabled?: boolean;
}) {
  const sector = options?.sector ?? null;
  const query = useQuery({
    queryKey: ["pages", "companies-overview-summary", sector ?? "all"],
    queryFn: () => getPageCompaniesOverviewSummary(sector),
    enabled: options?.enabled ?? true,
    staleTime: STALE_TIME,
  });

  return {
    summary: query.data,
    loading: query.isLoading,
    error: query.error,
  };
}

/** Unfiltered summary: industry chips/pie stay comparable after a sector pick. */
export function usePageCompaniesOverviewChrome(options?: { enabled?: boolean }) {
  return usePageCompaniesOverviewSummary({
    sector: null,
    enabled: options?.enabled,
  });
}
