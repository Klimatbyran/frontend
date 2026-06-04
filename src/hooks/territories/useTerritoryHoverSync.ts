import { useCallback, useState } from "react";

export function useTerritoryHoverSync() {
  const [hoveredMapName, setHoveredMapName] = useState<string | null>(null);

  const isHovered = useCallback(
    (mapName: string) =>
      hoveredMapName?.toLowerCase() === mapName.toLowerCase(),
    [hoveredMapName],
  );

  return {
    hoveredMapName,
    setHoveredMapName,
    isHovered,
  };
}
