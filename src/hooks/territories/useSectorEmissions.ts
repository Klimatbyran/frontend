import { useQuery } from "@tanstack/react-query";
import { SectorEmissionsByYear } from "@/types/emissions";

export type EntityType = "municipalities" | "regions";

// The API returns { sectors: { [year]: { [sector]: number } } }
export type SectorEmissionsResponse = {
  sectors: SectorEmissionsByYear;
};

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
    // Cast to SectorEmissionsByYear | null to match component prop type
    // Even though the actual structure has a 'sectors' wrapper that the component uses
    sectorEmissions:
      (sectorEmissions as SectorEmissionsResponse | null) as SectorEmissionsByYear | null,
    loading: isLoading,
    error,
  };
}
