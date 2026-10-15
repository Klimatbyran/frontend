import { useMemo } from "react";
import { useRegionDetails } from "@/hooks/regions/useRegionDetails";
import { useTerritoryDetailPageData } from "@/hooks/territories/useTerritoryDetailPageData";
import { useMunicipalities } from "@/hooks/municipalities/useMunicipalities";
import { useMunicipalityKPIs } from "@/hooks/municipalities/useMunicipalityKPIs";

export function useRegionPageData(regionId: string) {
  const { region, loading: regionLoading, error } = useRegionDetails(regionId);
  const { municipalities, municipalitiesLoading } = useMunicipalities();
  const { loading: municipalityKpisLoading } = useMunicipalityKPIs();

  const { sectorEmissionsLoading, ...territoryPageData } =
    useTerritoryDetailPageData(region, "regions", regionId);

  const regionMunicipalities = useMemo(() => {
    if (!region || !municipalities) return [];
    return municipalities
      .filter((m) => m.region === region.name)
      .map((m) => m.name)
      .sort();
  }, [region, municipalities]);

  const relatedListLoading =
    regionMunicipalities.length > 0 && municipalityKpisLoading;

  return {
    region,
    error,
    regionMunicipalities,
    ...territoryPageData,
    loading:
      regionLoading ||
      municipalitiesLoading ||
      sectorEmissionsLoading ||
      relatedListLoading,
  };
}
