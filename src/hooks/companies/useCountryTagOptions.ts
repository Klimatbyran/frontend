import { useQuery } from "@tanstack/react-query";
import { getCountryTagOptions } from "@/lib/api";

export function useCountryTagOptions() {
  return useQuery({
    queryKey: ["tag-options", "COUNTRY"],
    queryFn: getCountryTagOptions,
    staleTime: 60 * 60 * 1000,
  });
}
