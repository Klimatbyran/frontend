import { FeatureCollection } from "geojson";
import { DetailTerritoryMap } from "@/components/maps/DetailTerritoryMap";
import { TERRITORY_PANEL_CLASS } from "@/hooks/territories/useTerritoryListLayout";
import { DataItem, DataKPI, MapEntityType } from "@/types/rankings";
import { cn } from "@/lib/utils";

interface RelatedTerritoriesMapPanelProps {
  entityType: MapEntityType;
  geoData: FeatureCollection;
  mapData: DataItem[];
  selectedKPI?: DataKPI;
  onAreaClick: (mapName: string) => void;
  defaultCenter: [number, number];
  loading: boolean;
  hoveredMapName: string | null;
  onHoveredMapNameChange: (mapName: string | null) => void;
}

export function RelatedTerritoriesMapPanel({
  entityType,
  geoData,
  mapData,
  selectedKPI,
  onAreaClick,
  defaultCenter,
  loading,
  hoveredMapName,
  onHoveredMapNameChange,
}: RelatedTerritoriesMapPanelProps) {
  return (
    <div className={cn("relative min-w-0", TERRITORY_PANEL_CLASS)}>
      {loading ? (
        <div className="h-full w-full animate-pulse bg-black-1 rounded-level-2" />
      ) : selectedKPI ? (
        <DetailTerritoryMap
          entityType={entityType}
          geoData={geoData}
          data={mapData}
          selectedKPI={selectedKPI}
          onAreaClick={onAreaClick}
          defaultCenter={defaultCenter}
          hoveredArea={hoveredMapName}
          onHoveredAreaChange={onHoveredMapNameChange}
        />
      ) : null}
    </div>
  );
}
