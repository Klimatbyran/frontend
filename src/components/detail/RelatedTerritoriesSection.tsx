import MultiPagePagination from "@/components/ui/multi-page-pagination";
import { DetailTerritoryMap } from "@/components/maps/DetailTerritoryMap";
import { TerritoryListRow } from "@/components/detail/TerritoryListRow";
import {
  TERRITORY_LIST_PANEL_CLASS,
  TERRITORY_PANEL_CLASS,
} from "@/hooks/territories/useTerritoryListLayout";
import type { useRelatedTerritoriesSection } from "@/hooks/territories/useRelatedTerritoriesSection";
import { MapEntityType } from "@/types/rankings";
import { toRoutingEntityType } from "@/utils/territoryMapUtils";
import { cn } from "@/lib/utils";

export type RelatedTerritoriesSectionState = ReturnType<
  typeof useRelatedTerritoriesSection
>;

interface RelatedTerritoriesSectionProps {
  entityType: MapEntityType;
  state: RelatedTerritoriesSectionState;
}

export function RelatedTerritoriesSection({
  entityType,
  state,
}: RelatedTerritoriesSectionProps) {
  const {
    selectedKPI,
    mapData,
    geoData,
    onAreaClick,
    defaultCenter,
    loading,
    hoveredMapName,
    setHoveredMapName,
    isHovered,
    layoutRef,
    panelRef,
    visibleTerritories,
    showPagination,
    currentPage,
    totalPages,
    setCurrentPage,
  } = state;

  if (!loading && !selectedKPI) {
    return null;
  }

  const routingEntityType = toRoutingEntityType(entityType);

  return (
    <div
      ref={layoutRef}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
    >
      <div className={cn("relative min-w-0", TERRITORY_PANEL_CLASS)}>
        {loading ? (
          <div className="h-full w-full animate-pulse bg-black-1 rounded-level-2" />
        ) : (
          selectedKPI && (
            <DetailTerritoryMap
              entityType={entityType}
              geoData={geoData}
              data={mapData}
              selectedKPI={selectedKPI}
              onAreaClick={onAreaClick}
              defaultCenter={defaultCenter}
              hoveredArea={hoveredMapName}
              onHoveredAreaChange={setHoveredMapName}
            />
          )
        )}
      </div>
      {selectedKPI && (
        <div
          ref={panelRef}
          className={cn(
            TERRITORY_LIST_PANEL_CLASS,
            showPagination && "min-h-0",
          )}
        >
          <div
            className={cn(
              "grid grid-cols-2 gap-2 content-start",
              showPagination && "flex-1 min-h-0",
            )}
          >
            {visibleTerritories.map((territory) => (
              <TerritoryListRow
                key={territory.mapName}
                territory={territory}
                routingEntityType={routingEntityType}
                isHovered={isHovered(territory.mapName)}
                onHover={setHoveredMapName}
              />
            ))}
          </div>
          {showPagination && (
            <MultiPagePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}
    </div>
  );
}
