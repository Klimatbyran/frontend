import { useQuery } from "@tanstack/react-query";
import { getClimateTraceCountryEmissions } from "@/lib/climateTrace";
import { CLIMATE_TRACE_REPORTED_END_YEAR } from "@/utils/europe/climateTraceKpis";

export function useClimateTraceEmissions() {
  const { data, isLoading, error } = useQuery({
    queryKey: [
      "climate-trace-country-emissions-time-series",
      CLIMATE_TRACE_REPORTED_END_YEAR,
    ],
    queryFn: getClimateTraceCountryEmissions,
    staleTime: 1000 * 60 * 60,
  });

  return {
    emissionsByIso: data ?? {},
    isLoading,
    error,
  };
}
