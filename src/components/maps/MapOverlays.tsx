import { t } from "i18next";
import { DataItem, DataKPI, KPIValue, MapEntityType } from "@/types/rankings";
import { MapZoomControls } from "./MapZoomControls";
import { MapLegend } from "./MapLegend";
import { MapTooltip } from "./MapTooltip";

interface MapOverlaysProps {
  entityType: MapEntityType;
  selectedKPI: DataKPI;
  hoveredArea: string | null;
  hoveredValue: number | boolean | null;
  hoveredRank: number | null;
  data: DataItem[];
  leftValue: number;
  rightValue: number;
  hasNullValues: boolean;
  positionZoom: number;
  minZoom: number;
  maxZoom: number;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleReset: () => void;
}

function MapOverlays({
  entityType,
  selectedKPI,
  hoveredArea,
  hoveredValue,
  hoveredRank,
  data,
  leftValue,
  rightValue,
  hasNullValues,
  positionZoom,
  minZoom,
  maxZoom,
  handleZoomIn,
  handleZoomOut,
  handleReset,
}: MapOverlaysProps) {
  return (
    <>
      {hoveredArea && (
        <MapTooltip
          entityType={entityType}
          name={hoveredArea}
          value={hoveredValue}
          rank={hoveredRank}
          unit={selectedKPI.unit ?? ""}
          total={data.length}
          nullValue={
            selectedKPI.key
              ? t(`${entityType}.list.kpis.${selectedKPI.key}.nullValues`)
              : "No data"
          }
          selectedKPI={selectedKPI as KPIValue}
        />
      )}
      <MapLegend
        entityType={entityType}
        leftValue={leftValue}
        rightValue={rightValue}
        unit={selectedKPI.unit ?? ""}
        selectedKPI={selectedKPI as KPIValue}
        hasNullValues={hasNullValues}
      />
      <MapZoomControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        canZoomIn={positionZoom < maxZoom}
        canZoomOut={positionZoom > minZoom}
      />
    </>
  );
}

export default MapOverlays;
