import { useMemo } from "react";
import { FeatureCollection } from "geojson";
import { cn } from "@/lib/utils";
import { TERRITORY_MAP_COLORS } from "@/utils/territoryMapUtils";
import { DataItem, DataKPI, MapEntityType } from "@/types/rankings";
import { calculateGeoBounds } from "./utils/geoBounds";
import { useMapData } from "./hooks/useMapData";
import { useMapInteractions } from "./hooks/useMapInteractions";
import { useMapZoom } from "./hooks/useMapZoom";
import { useMapPosition } from "./hooks/useMapPosition";
import { useMapLegendValues } from "./hooks/useMapLegendValues";
import MapContent from "./MapContent";
import MapOverlays from "./MapOverlays";
import type { MapLegendPosition } from "./MapLegend";

import "leaflet/dist/leaflet.css";

interface TerritoryMapProps {
  entityType: MapEntityType;
  geoData: FeatureCollection;
  data: DataItem[];
  selectedKPI: DataKPI;
  onAreaClick?: (id: string) => void;
  defaultCenter?: [number, number];
  defaultZoom?: number;
  propertyNameField?: string;
  colors?: {
    null: string;
    gradientStart: string;
    gradientMidLow: string;
    gradientMidHigh: string;
    gradientEnd: string;
  };
  mapBackgroundColor?: string;
  scrollWheelZoom?: boolean;
  className?: string;
  showTooltip?: boolean;
  fitBoundsOnMount?: boolean;
  legendPosition?: MapLegendPosition;
  hoveredArea?: string | null;
  onHoveredAreaChange?: (area: string | null) => void;
}

function TerritoryMap({
  entityType,
  geoData,
  data,
  selectedKPI,
  onAreaClick = () => {},
  defaultCenter = [63, 17],
  defaultZoom,
  propertyNameField = "name",
  colors = TERRITORY_MAP_COLORS,
  mapBackgroundColor = "var(--black-2)",
  scrollWheelZoom = true,
  className,
  showTooltip = true,
  fitBoundsOnMount = false,
  legendPosition = "bottom-right",
  hoveredArea: hoveredAreaProp,
  onHoveredAreaChange,
}: TerritoryMapProps) {
  const { position, setPosition, getInitialZoom } = useMapPosition(
    defaultCenter,
    defaultZoom,
  );

  const { values, minValue, maxValue, sortedData } = useMapData(
    data,
    selectedKPI,
  );

  const mapBounds = useMemo(
    () => calculateGeoBounds(geoData, { padding: 0.05 }),
    [geoData],
  );

  const {
    mapRef,
    handleZoomIn,
    handleZoomOut,
    handleReset,
    MIN_ZOOM,
    MAX_ZOOM,
  } = useMapZoom(defaultCenter, getInitialZoom, {
    mapBounds,
    fitBoundsOnReset: fitBoundsOnMount,
  });

  const {
    hoveredArea,
    hoveredValue,
    hoveredRank,
    getAreaStyle,
    onEachFeature,
  } = useMapInteractions({
    data,
    selectedKPI,
    sortedData,
    values,
    propertyNameField,
    colors,
    onAreaClick,
    hoveredArea: hoveredAreaProp,
    onHoveredAreaChange,
  });

  const { leftValue, rightValue, hasNullValues } = useMapLegendValues(
    data,
    selectedKPI,
    minValue,
    maxValue,
  );

  return (
    <div className={cn("relative h-full w-full max-w-screen-lg", className)}>
      <MapContent
        geoData={geoData}
        position={position}
        mapBounds={mapBounds}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        mapRef={mapRef}
        getAreaStyle={getAreaStyle}
        onEachFeature={onEachFeature}
        setPosition={setPosition}
        backgroundColor={mapBackgroundColor}
        scrollWheelZoom={scrollWheelZoom}
        fitBoundsOnMount={fitBoundsOnMount}
      />
      <MapOverlays
        entityType={entityType}
        selectedKPI={selectedKPI}
        showTooltip={showTooltip}
        legendPosition={legendPosition}
        hoveredArea={hoveredArea}
        hoveredValue={hoveredValue}
        hoveredRank={hoveredRank}
        data={data}
        leftValue={leftValue}
        rightValue={rightValue}
        hasNullValues={hasNullValues}
        positionZoom={position.zoom}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        handleZoomIn={handleZoomIn}
        handleZoomOut={handleZoomOut}
        handleReset={handleReset}
        onAreaClick={onAreaClick}
      />
    </div>
  );
}

export default TerritoryMap;
