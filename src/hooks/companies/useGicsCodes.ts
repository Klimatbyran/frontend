import { useQuery } from "@tanstack/react-query";
import { getIndustryGics } from "@/lib/api";
import type { GicsNameFields, GicsOption } from "@/types/company";

export function useGicsCodes() {
  return useQuery({
    queryKey: ["industry-gics"],
    queryFn: getIndustryGics,
    select: (data): GicsOption[] =>
      Object.entries(
        (data as Record<string, Partial<GicsNameFields>>) || {},
      ).map(([code, value]) => ({
        code,
        label: value.subIndustryName,
        sector: value.sectorName,
        group: value.groupName,
        industry: value.industryName,
        description: value.subIndustryDescription,
        subIndustryName: value.subIndustryName,
      })),
  });
}
