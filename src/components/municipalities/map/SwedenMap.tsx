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
import { FeatureCollection } from "geojson";

interface MunicipalityKPI {
  label: string;
  key: keyof Municipality;
  unit: string;
  description?: string;
  higherIsBetter: boolean;
}

interface SwedenMapProps {
  geoData: FeatureCollection;
  municipalityData: Municipality[];
  selectedKPI: MunicipalityKPI;
  onMunicipalityClick: (name: string) => void;
}

function SwedenMap({
  geoData,
  municipalityData,
  selectedKPI,
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
    zoom: 0.8,
  });

  const values = municipalityData.map((m) => m[selectedKPI.key] as number);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const sortedMunicipalities = [...municipalityData].sort((a, b) => {
    const aValue = a[selectedKPI.key] as number;
    const bValue = b[selectedKPI.key] as number;
    return selectedKPI.higherIsBetter ? bValue - aValue : aValue - bValue;
  });

  const handleZoomIn = () => {
    if (position.zoom >= 4) {
      return;
    }
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 0.5) {
      return;
    }
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
    if (!municipality) {
      return { value: null, rank: null };
    }

    const value = municipality[selectedKPI.key] as number;
    const rank =
      sortedMunicipalities.findIndex((m) => m.name === municipality.name) + 1;

    return { value, rank };
  };

  const getColorByValue = (value: number | null): string => {
    if (value === null) {
      return "var(--pink-5)";
    }

    // Use CSS variables directly
    const startColor = "var(--pink-3)";
    const gradientMidLow = "var(--pink-4)";
    const gradientMidHigh = "var(--blue-4)";
    const endColor = "var(--blue-3)";

    // Calculate mean and standard deviation
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        values.length,
    );

    // Calculate z-score (number of standard deviations from mean)
    const zScore = (value - mean) / stdDev;

    // Determine which segment of the gradient to use based on z-score
    if (selectedKPI.higherIsBetter) {
      if (zScore <= -1) {
        // Below -1 std dev: interpolate between startColor (pink-4) and gradientMidLow (pink-3)
        const t = Math.max(0, (zScore + 2) / 1);
        return `color-mix(in srgb, ${startColor} ${(1 - t) * 100}%, ${gradientMidLow} ${t * 100}%)`;
      } else if (zScore <= 0) {
        // Between -1 and 0 std dev: interpolate between gradientMidLow (pink-3) and gradientMidHigh (blue-4)
        const t = Math.max(0, zScore + 1);
        return `color-mix(in srgb, ${gradientMidLow} ${(1 - t) * 100}%, ${gradientMidHigh} ${t * 100}%)`;
      } else if (zScore <= 1) {
        // Between 0 and 1 std dev: interpolate between gradientMidHigh (blue-4) and endColor (blue-3)
        const t = Math.max(0, zScore);
        return `color-mix(in srgb, ${gradientMidHigh} ${(1 - t) * 100}%, ${endColor} ${t * 100}%)`;
      } else {
        // Above 1 std dev: endColor
        return endColor;
      }
    } else {
      // For metrics where lower is better, reverse the logic
      if (zScore >= 1) {
        const t = Math.max(0, (2 - zScore) / 1);
        return `color-mix(in srgb, ${startColor} ${(1 - t) * 100}%, ${gradientMidLow} ${t * 100}%)`;
      } else if (zScore >= 0) {
        const t = Math.max(0, 1 - zScore);
        return `color-mix(in srgb, ${gradientMidLow} ${(1 - t) * 100}%, ${gradientMidHigh} ${t * 100}%)`;
      } else if (zScore >= -1) {
        const t = Math.max(0, -zScore);
        return `color-mix(in srgb, ${gradientMidHigh} ${(1 - t) * 100}%, ${endColor} ${t * 100}%)`;
      } else {
        return endColor;
      }
    }
  };

  const renderGradientLegend = () => {
    const leftValue = selectedKPI.higherIsBetter ? minValue : maxValue;
    const rightValue = selectedKPI.higherIsBetter ? maxValue : minValue;

    return (
      <MapGradientLegend
        label={selectedKPI.label}
        leftValue={leftValue}
        rightValue={rightValue}
        unit={selectedKPI.unit}
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
                        stroke: "var(--black-1)",
                        strokeWidth: 0.2,
                        outline: "none",
                        cursor: "pointer",
                      },
                      hover: {
                        fill:
                          value === null
                            ? "var(--pink-4)"
                            : getColorByValue(value),
                        stroke: "var(--grey)",
                        strokeWidth: 0.4,
                        outline: "none",
                      },
                      pressed: {
                        fill:
                          value === null
                            ? "var(--black-1)"
                            : getColorByValue(value),
                        stroke: "var(--grey)",
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
          label={selectedKPI.label}
          unit={selectedKPI.unit}
          total={municipalityData.length}
        />
      )}

      {renderGradientLegend()}
      {renderZoomControls()}
    </div>
  );
}

export default SwedenMap;
