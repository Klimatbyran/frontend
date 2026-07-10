import { useQuery } from "@tanstack/react-query";
import {
  CLIMATE_TRACE_SOURCES_LIMIT,
  fetchClimateTraceSourcesForCountry,
} from "@/lib/climateTraceSources";
import { CLIMATE_TRACE_REPORTED_END_YEAR } from "@/utils/europe/climateTraceKpis";

const CLIMATE_TRACE_SOURCES_QUERY_VERSION = "v1";

export function useClimateTraceSources(
  iso3: string | undefined,
  year: number | undefined,
) {
  const reportedYear = year ?? CLIMATE_TRACE_REPORTED_END_YEAR;

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "climate-trace-country-sources",
      iso3,
      reportedYear,
      CLIMATE_TRACE_SOURCES_LIMIT,
      CLIMATE_TRACE_SOURCES_QUERY_VERSION,
    ],
    queryFn: () =>
      fetchClimateTraceSourcesForCountry(iso3!, reportedYear),
    enabled: Boolean(iso3),
    staleTime: 1000 * 60 * 60,
  });

  return {
    sources: data ?? [],
    isLoading,
    error,
  };
}
