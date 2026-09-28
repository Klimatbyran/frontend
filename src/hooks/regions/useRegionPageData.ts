import { useMemo } from "react";
import { useRegionDetails } from "@/hooks/regions/useRegionDetails";
import { useTerritoryDetailPageData } from "@/hooks/territories/useTerritoryDetailPageData";

export function useRegionPageData(regionId: string) {
  const { region, loading, error } = useRegionDetails(regionId);

  const territoryPageData = useTerritoryDetailPageData(
    region,
    "regions",
    regionId,
  );

  const regionMunicipalities = useMemo(() => {
    if (!region?.municipalities) return [];
    return [...region.municipalities].sort();
  }, [region]);

  return {
    region,
    loading,
    error,
    regionMunicipalities,
    ...territoryPageData,
  };
}
