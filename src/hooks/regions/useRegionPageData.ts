import { useMemo } from "react";
import { useRegionDetails } from "@/hooks/regions/useRegionDetails";
import { useTerritoryDetailPageData } from "@/hooks/territories/useTerritoryDetailPageData";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";

export function useRegionPageData(regionId: string) {
  const { region, loading, error } = useRegionDetails(regionId);
  const { municipalities } = useMunicipalities();

  const territoryPageData = useTerritoryDetailPageData(
    region,
    "regions",
    regionId,
  );

  const regionMunicipalities = useMemo(() => {
    if (!region || !municipalities) return [];
    return municipalities
      .filter((m) => m.region === region.name)
      .map((m) => m.name)
      .sort();
  }, [region, municipalities]);

  return {
    region,
    loading,
    error,
    regionMunicipalities,
    ...territoryPageData,
  };
}
