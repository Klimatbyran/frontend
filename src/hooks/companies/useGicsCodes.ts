import { useQuery } from "@tanstack/react-query";
import { getIndustryGics } from "@/lib/api";
import type { GicsOption } from "@/types/company";

export function useGicsCodes() {
  return useQuery({
    queryKey: ["industry-gics"],
    queryFn: getIndustryGics,
    select: (data): GicsOption[] =>
      Object.entries(data || {}).map(([code, value]) => {
        const v = value as any;
        return {
          code,
          label: v.subIndustryName,
          sector: v.sectorName,
          group: v.groupName,
          industry: v.industryName,
          description: v.subIndustryDescription,
          subIndustryName: v.subIndustryName,
        };
      }),
  });
}
