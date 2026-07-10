import { t } from "i18next";
import { DataItem, DataKPI, KPIValue, MapEntityType } from "@/types/rankings";
import { MapZoomControls } from "./MapZoomControls";
import { MapLegend, MapLegendPosition } from "./MapLegend";
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
  onAreaClick?: (id: string) => void;
  showTooltip?: boolean;
  legendPosition?: MapLegendPosition;
}

function MapOverlays({
  entityType,
  selectedKPI,
  showTooltip = true,
  legendPosition = "bottom-right",
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
  onAreaClick,
}: MapOverlaysProps) {
  const hoveredItem = hoveredArea
    ? data.find((item) => item.name === hoveredArea)
    : undefined;
  const tooltipName =
    hoveredItem && typeof hoveredItem.displayName === "string"
      ? hoveredItem.displayName
      : hoveredArea;

  return (
    <>
      {showTooltip && hoveredArea && (
        <MapTooltip
          entityType={entityType}
          name={tooltipName ?? hoveredArea}
          value={hoveredValue}
          rank={hoveredRank}
          unit={selectedKPI.unit ?? ""}
          total={data.length}
          nullValue={
            selectedKPI.key
              ? t(`${entityType}.list.kpis.${selectedKPI.key}.nullValues`)
              : t("noData")
          }
          selectedKPI={selectedKPI as KPIValue}
          onClick={onAreaClick ? () => onAreaClick(hoveredArea) : undefined}
        />
      )}
      <MapLegend
        entityType={entityType}
        leftValue={leftValue}
        rightValue={rightValue}
        unit={selectedKPI.unit ?? ""}
        selectedKPI={selectedKPI as KPIValue}
        hasNullValues={hasNullValues}
        position={legendPosition}
      />
      <MapZoomControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        canZoomIn={positionZoom < maxZoom}
        canZoomOut={positionZoom > minZoom}
        legendPosition={legendPosition}
      />
    </>
  );
}

export default MapOverlays;
