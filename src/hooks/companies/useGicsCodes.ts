import { useQuery } from "@tanstack/react-query";
import { getIndustryGics } from "@/lib/api";
import type { GicsOption } from "@/types/company";

// Raw API response structure for a single GICS code value
// The API returns a Record<string, GicsApiValue>
interface GicsApiValue {
  subIndustryName?: string;
  sectorName?: string;
  groupName?: string;
  industryName?: string;
  subIndustryDescription?: string;
}

export function useGicsCodes() {
  return useQuery({
    queryKey: ["industry-gics"],
    queryFn: getIndustryGics,
    select: (data): GicsOption[] =>
      Object.entries((data as Record<string, GicsApiValue>) || {}).map(
        ([code, value]) => ({
          code,
          label: value.subIndustryName,
          sector: value.sectorName,
          group: value.groupName,
          industry: value.industryName,
          description: value.subIndustryDescription,
          subIndustryName: value.subIndustryName,
        }),
      ),
  });
}
