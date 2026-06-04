import { RefObject } from "react";
import MultiPagePagination from "@/components/ui/multi-page-pagination";
import { TerritoryListRow } from "@/components/detail/TerritoryListRow";
import { TERRITORY_LIST_PANEL_CLASS } from "@/hooks/territories/useTerritoryListLayout";
import { MapEntityType } from "@/types/rankings";
import { TerritoryListEntry } from "@/utils/territoryMapUtils";
import { cn } from "@/lib/utils";

interface RelatedTerritoriesListProps {
  visibleTerritories: TerritoryListEntry[];
  entityType: MapEntityType;
  isHovered: (mapName: string) => boolean;
  onHover: (mapName: string | null) => void;
  panelRef?: RefObject<HTMLDivElement | null>;
  showPagination: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const ROUTING_ENTITY_TYPE: Record<MapEntityType, "region" | "municipality"> = {
  regions: "region",
  municipalities: "municipality",
};

export function RelatedTerritoriesList({
  visibleTerritories,
  entityType,
  isHovered,
  onHover,
  panelRef,
  showPagination,
  currentPage,
  totalPages,
  onPageChange,
}: RelatedTerritoriesListProps) {
  const routingEntityType = ROUTING_ENTITY_TYPE[entityType];
  return (
    <div
      ref={panelRef}
      className={cn(TERRITORY_LIST_PANEL_CLASS, showPagination && "min-h-0")}
    >
      <div
        className={cn(
          "grid grid-cols-2 gap-x-3 gap-y-2 content-start",
          showPagination && "flex-1 min-h-0",
        )}
      >
        {visibleTerritories.map((territory) => (
            <TerritoryListRow
              key={territory.mapName}
              territory={territory}
              routingEntityType={routingEntityType}
              isHovered={isHovered(territory.mapName)}
            onHover={onHover}
          />
        ))}
      </div>
      {showPagination && (
        <MultiPagePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
