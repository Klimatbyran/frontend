import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { Municipality } from "@/types/municipality";
import { MapZoomControls } from "./MapZoomControls";
import { MapGradientLegend } from "./MapLegendGradient";
import { MapTooltip } from "./MapTooltip";
interface DataPoint {
  label: string;
  key: keyof Municipality;
  unit: string;
  description?: string;
  higherIsBetter: boolean;
}

interface SwedenMapProps {
  geoData: any;
  municipalityData: Municipality[];
  selectedDataPoint: DataPoint;
  onMunicipalityClick: (name: string) => void;
}

function SwedenMap({
  geoData,
  municipalityData,
  selectedDataPoint,
  onMunicipalityClick,
}: SwedenMapProps) {
  const [hoveredMunicipality, setHoveredMunicipality] = React.useState<
    string | null
  >(null);
  const [hoveredValue, setHoveredValue] = React.useState<number | null>(null);
  const [hoveredRank, setHoveredRank] = React.useState<number | null>(null);
  const [position, setPosition] = React.useState<{
    coordinates: [number, number];
    zoom: number;
  }>({
    coordinates: [17, 63],
    zoom: 1,
  });

  // Calculate min and max values for the color scale
  const values = municipalityData.map(
    (m) => m[selectedDataPoint.key] as number,
  );
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Sort municipalities by the selected metric for ranking
  const sortedMunicipalities = [...municipalityData].sort((a, b) => {
    const aValue = a[selectedDataPoint.key] as number;
    const bValue = b[selectedDataPoint.key] as number;
    return selectedDataPoint.higherIsBetter ? bValue - aValue : aValue - bValue;
  });

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 0.5) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleReset = () => {
    setPosition({ coordinates: [17, 63], zoom: 1 });
  };

  const handleMoveEnd = (position: {
    coordinates: [number, number];
    zoom: number;
  }) => {
    setPosition(position);
  };

  const getMunicipalityData = (
    name: string,
  ): { value: number | null; rank: number | null } => {
    const municipality = municipalityData.find(
      (m) => m.name.toLowerCase() === name.toLowerCase(),
    );
    if (!municipality) return { value: null, rank: null };

    const value = municipality[selectedDataPoint.key] as number;
    const rank =
      sortedMunicipalities.findIndex((m) => m.name === municipality.name) + 1;

    return { value, rank };
  };

  const getColorByValue = (value: number | null): string => {
    if (value === null) return "#1a1a1a";

    const normalizedValue = (value - minValue) / (maxValue - minValue);
    // Adjust color value based on whether higher or lower is better
    const colorValue = selectedDataPoint.higherIsBetter
      ? normalizedValue
      : 1 - normalizedValue;

    // Use a more subtle color palette
    const hue = colorValue * 120; // Green (120) to Red (0)
    return `hsl(${hue}, 70%, ${20 + colorValue * 30}%)`; // Darker colors
  };

  const renderGradientLegend = () => {
    // Always show worse values on the left and better values on the right
    const leftValue = selectedDataPoint.higherIsBetter ? minValue : maxValue;
    const rightValue = selectedDataPoint.higherIsBetter ? maxValue : minValue;

    return (
      <MapGradientLegend
        label={selectedDataPoint.label}
        leftValue={leftValue}
        rightValue={rightValue}
        unit={selectedDataPoint.unit}
        getColor={getColorByValue}
      />
    );
  };

  const renderZoomControls = () => (
    <MapZoomControls
      onZoomIn={handleZoomIn}
      onZoomOut={handleZoomOut}
      onReset={handleReset}
      canZoomIn={true}
      canZoomOut={true}
    />
  );

  return (
    <div className="relative flex-1 h-full max-w-screen-lg">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1800,
        }}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#000",
        }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
          maxZoom={4}
          minZoom={0.5}
        >
          <Geographies geography={geoData}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const { value, rank } = getMunicipalityData(
                  geo.properties.name,
                );
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => {
                      setHoveredMunicipality(geo.properties.name);
                      setHoveredValue(value);
                      setHoveredRank(rank);
                    }}
                    onMouseLeave={() => {
                      setHoveredMunicipality(null);
                      setHoveredValue(null);
                      setHoveredRank(null);
                    }}
                    onClick={() => onMunicipalityClick(geo.properties.name)}
                    style={{
                      default: {
                        fill: getColorByValue(value),
                        stroke: "#333",
                        strokeWidth: 0.2,
                        outline: "none",
                        cursor: "pointer",
                      },
                      hover: {
                        fill: value === null ? "#333" : getColorByValue(value),
                        stroke: "#666",
                        strokeWidth: 0.4,
                        outline: "none",
                      },
                      pressed: {
                        fill: value === null ? "#333" : getColorByValue(value),
                        stroke: "#666",
                        strokeWidth: 0.4,
                        outline: "none",
                      },
                    }}
                    tabIndex={-1}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {hoveredMunicipality && (
        <MapTooltip
          name={hoveredMunicipality}
          value={hoveredValue}
          rank={hoveredRank}
          label={selectedDataPoint.label}
          unit={selectedDataPoint.unit}
          total={municipalityData.length}
        />
      )}

      {renderGradientLegend()}
      {renderZoomControls()}
    </div>
  );
}

export default SwedenMap;
