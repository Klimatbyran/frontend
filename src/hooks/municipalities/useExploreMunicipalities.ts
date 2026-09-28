import { useQuery } from "@tanstack/react-query";
import { getExploreMunicipalitiesPage } from "@/lib/api";
import { mapExploreMunicipality } from "@/lib/page-mappers";
import type { Municipality } from "@/types/municipality";

const STALE_TIME = 1800000;

export function useExploreMunicipalities(options?: { enabled?: boolean }) {
  const {
    data: municipalities = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pages", "explore", "municipalities"],
    queryFn: getExploreMunicipalitiesPage,
    enabled: options?.enabled ?? true,
    staleTime: STALE_TIME,
    select: (data): Municipality[] => data.items.map(mapExploreMunicipality),
  });

  return {
    municipalities,
    municipalitiesLoading: isLoading,
    municipalitiesError: error,
  };
}
