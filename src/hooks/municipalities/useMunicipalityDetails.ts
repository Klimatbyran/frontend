import { useQuery } from "@tanstack/react-query";
import { getMunicipalityDetails } from "@/lib/api";
import { Municipality } from "@/types/municipality";

export function useMunicipalityDetails(id: string) {
  const {
    data: municipality,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["municipality", id],
    queryFn: () => getMunicipalityDetails(id),
    enabled: !!id,
  });

  return {
    municipality: (municipality as Municipality) || null,
    loading: isLoading,
    error,
  };
}
