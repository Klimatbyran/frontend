import { useMemo } from "react";
import { FeatureCollection } from "geojson";
import { DataItem, DataKPI, MapEntityType } from "@/types/rankings";
import { calculateGeoBounds } from "./utils/geoBounds";
import { useMapData } from "./hooks/useMapData";
import { useMapInteractions } from "./hooks/useMapInteractions";
import { useMapZoom } from "./hooks/useMapZoom";
import { useMapPosition } from "./hooks/useMapPosition";
import { useMapLegendValues } from "./hooks/useMapLegendValues";
import MapContent from "./MapContent";
import MapOverlays from "./MapOverlays";

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
  colors = {
    null: "var(--grey)",
    gradientStart: "var(--pink-5)",
    gradientMidLow: "var(--pink-4)",
    gradientMidHigh: "var(--pink-3)",
    gradientEnd: "var(--blue-3)",
  },
}: TerritoryMapProps) {
  const { position, setPosition, getInitialZoom } = useMapPosition(
    defaultCenter,
    defaultZoom,
  );

  const { values, minValue, maxValue, sortedData } = useMapData(
    data,
    selectedKPI,
  );

  const {
    mapRef,
    handleZoomIn,
    handleZoomOut,
    handleReset,
    MIN_ZOOM,
    MAX_ZOOM,
  } = useMapZoom(defaultCenter, getInitialZoom);

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
  });

  const mapBounds = useMemo(
    () => calculateGeoBounds(geoData, { padding: 0.05 }),
    [geoData],
  );

  const { leftValue, rightValue, hasNullValues } = useMapLegendValues(
    data,
    selectedKPI,
    minValue,
    maxValue,
  );

  return (
    <div className="relative flex-1 h-full max-w-screen-lg">
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
      />
      <MapOverlays
        entityType={entityType}
        selectedKPI={selectedKPI}
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
