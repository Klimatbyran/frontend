import { useQuery } from "@tanstack/react-query";
import { SectorEmissionsByYear } from "@/types/emissions";

export type EntityType = "municipalities" | "regions";

// The API returns { sectors: { [year]: { [sector]: number } } }
export type SectorEmissionsResponse = {
  sectors: SectorEmissionsByYear;
};

// Type alias for components that expect { sectors: SectorEmissionsByYear }
export type SectorEmissions = SectorEmissionsResponse;

export function useSectorEmissions(
  entityType: EntityType,
  id: string | undefined,
) {
  const {
    data: sectorEmissions,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`${entityType}SectorEmissions`, id],
    queryFn: () =>
      fetch(
        `/api/${entityType}/${encodeURIComponent(id || "")}/sector-emissions`,
      ).then((res) => res.json()),
    enabled: !!id,
  });

  return {
    // Return the API response structure directly (with sectors wrapper)
    sectorEmissions: sectorEmissions as SectorEmissionsResponse | null,
    loading: isLoading,
    error,
  };
}
