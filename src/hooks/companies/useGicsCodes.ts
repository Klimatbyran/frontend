import { useQuery } from "@tanstack/react-query";
import { getIndustryGics } from "@/lib/api";
import type { GicsOption } from "@/types/company";

export function useGicsCodes() {
  return useQuery({
    queryKey: ["industry-gics"],
    queryFn: getIndustryGics,
    select: (data): GicsOption[] => Object.values(data || {}),
  });
}
