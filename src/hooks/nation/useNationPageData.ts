import { useMemo } from "react";
import { useNationDetails } from "@/hooks/nation/useNationDetails";
import { useTerritoryDetailPageData } from "@/hooks/territories/useTerritoryDetailPageData";
import { useRegionsList } from "@/hooks/regions/useRegionsList";
import { useRegionsKPIs } from "@/hooks/regions/useRegionKPIs";

export function useNationPageData() {
  const { nation, loading: nationLoading, error } = useNationDetails();
  const { regions, loading: regionsLoading } = useRegionsList();
  const { loading: regionKpisLoading } = useRegionsKPIs();
  const sortedRegions = useMemo(() => [...regions].sort(), [regions]);

  const { sectorEmissionsLoading, ...territoryPageData } =
    useTerritoryDetailPageData(nation, "nation");

  const relatedListLoading = sortedRegions.length > 0 && regionKpisLoading;

  return {
    nation,
    error,
    sortedRegions,
    ...territoryPageData,
    loading:
      nationLoading ||
      regionsLoading ||
      sectorEmissionsLoading ||
      relatedListLoading,
  };
}
