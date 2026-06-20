import { useQuery } from "@tanstack/react-query";
import { getClimateTraceCountryEmissions } from "@/lib/climateTrace";

export function useClimateTraceEmissions() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["climate-trace-country-emissions-time-series"],
    queryFn: getClimateTraceCountryEmissions,
    staleTime: 1000 * 60 * 60,
  });

  return {
    emissionsByIso: data ?? {},
    isLoading,
    error,
  };
}
