import { useCallback, useState } from "react";
import { MapEntityType } from "@/types/rankings";
import { useRelatedTerritoriesMap } from "./useRelatedTerritoriesMap";
import { useTerritoryListLayout } from "./useTerritoryListLayout";

export function useRelatedTerritoriesSection(
  items: string[],
  entityType: MapEntityType,
  paginationEnabled: boolean,
) {
  const mapState = useRelatedTerritoriesMap({ items, entityType });
  const [hoveredMapName, setHoveredMapName] = useState<string | null>(null);

  const isHovered = useCallback(
    (mapName: string) =>
      hoveredMapName?.toLowerCase() === mapName.toLowerCase(),
    [hoveredMapName],
  );

  const layout = useTerritoryListLayout(
    mapState.territories,
    paginationEnabled,
    hoveredMapName,
  );

  const setCurrentPage = useCallback(
    (page: number) => {
      setHoveredMapName(null);
      layout.setCurrentPage(page);
    },
    [layout.setCurrentPage],
  );

  return {
    ...mapState,
    ...layout,
    setCurrentPage,
    hoveredMapName,
    setHoveredMapName,
    isHovered,
  };
}
