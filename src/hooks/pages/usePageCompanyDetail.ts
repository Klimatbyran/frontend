import { useQuery } from "@tanstack/react-query";
import {
  getPageCompanyEmissionsHistory,
  getPageCompanyHeader,
  getPageCompanyOverview,
  getPageCompanyScope3,
  getPageCompanyTurnoverHistory,
} from "@/lib/pagesApi";

const STALE_TIME = 1_800_000;

export function usePageCompanyHeader(id: string, enabled = true) {
  const query = useQuery({
    queryKey: ["pages", "company-header", id],
    queryFn: () => getPageCompanyHeader(id),
    enabled: enabled && !!id,
    staleTime: STALE_TIME,
  });

  return {
    header: query.data,
    loading: query.isLoading,
    error: query.error,
  };
}

export function usePageCompanyOverview(
  id: string,
  year: number | undefined,
  enabled = true,
) {
  const query = useQuery({
    queryKey: ["pages", "company-overview", id, year ?? "latest"],
    queryFn: () => getPageCompanyOverview(id, year),
    enabled: enabled && !!id,
    staleTime: STALE_TIME,
  });

  return {
    overview: query.data,
    loading: query.isLoading,
    error: query.error,
  };
}

export function usePageCompanyHistories(id: string, enabled = true) {
  const emissions = useQuery({
    queryKey: ["pages", "company-emissions-history", id],
    queryFn: () => getPageCompanyEmissionsHistory(id),
    enabled: enabled && !!id,
    staleTime: STALE_TIME,
  });
  const turnover = useQuery({
    queryKey: ["pages", "company-turnover-history", id],
    queryFn: () => getPageCompanyTurnoverHistory(id),
    enabled: enabled && !!id,
    staleTime: STALE_TIME,
  });

  return {
    emissionsHistory: emissions.data,
    turnoverHistory: turnover.data,
    loading: emissions.isLoading || turnover.isLoading,
    error: emissions.error || turnover.error,
  };
}

export function usePageCompanyScope3(
  id: string,
  year: number | undefined,
  enabled = true,
) {
  const query = useQuery({
    queryKey: ["pages", "company-scope3", id, year ?? "latest"],
    queryFn: () => getPageCompanyScope3(id, year),
    enabled: enabled && !!id,
    staleTime: STALE_TIME,
  });

  return {
    scope3: query.data,
    loading: query.isLoading,
    error: query.error,
  };
}
