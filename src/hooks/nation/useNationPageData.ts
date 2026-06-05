import { useMemo } from "react";
import { useNationDetails } from "@/hooks/nation/useNationDetails";
import { useTerritoryDetailPageData } from "@/hooks/territories/useTerritoryDetailPageData";
import { useRegionsList } from "@/hooks/regions/useRegionsList";

export function useNationPageData() {
  const { nation, loading, error } = useNationDetails();
  const { regions } = useRegionsList();
  const sortedRegions = useMemo(() => [...regions].sort(), [regions]);

  const territoryPageData = useTerritoryDetailPageData(nation, "nation");

  return {
    nation,
    loading,
    error,
    sortedRegions,
    ...territoryPageData,
  };
}
