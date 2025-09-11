import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { KPIValue, Municipality } from "@/types/municipality";
import { MapZoomControls } from "./MapZoomControls";
import { MapLegend } from "./MapLegend";
import { MapTooltip } from "./MapTooltip";
import { FeatureCollection } from "geojson";
import { MUNICIPALITY_MAP_COLORS } from "./constants";
import { isMobile } from "react-device-detect";
import { t } from "i18next";
import { getSortedMunicipalKPIValues } from "@/utils/data/sorting";

interface SwedenMapProps {
  geoData: FeatureCollection;
  municipalityData: Municipality[];
  selectedKPI: KPIValue;
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
  const getInitialZoom = () => (isMobile ? 1 : 0.7);

  const [position, setPosition] = React.useState<{
    coordinates: [number, number];
    zoom: number;
  }>({
    coordinates: [17, 62],
    zoom: getInitialZoom(),
  });

  React.useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        ...prev,
        zoom: getInitialZoom(),
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const values = municipalityData.map((m) => m[selectedKPI.key] as number);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const sortedMunicipalities = getSortedMunicipalKPIValues(
    municipalityData,
    selectedKPI,
  );

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
      return MUNICIPALITY_MAP_COLORS.null;
    }

    const { start, gradientMidLow, gradientMidHigh, end } =
      MUNICIPALITY_MAP_COLORS;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        values.length,
    );

    const zScore = (value - mean) / stdDev;

    if (selectedKPI.higherIsBetter) {
      if (zScore <= -1) {
        // Below -1 std dev: interpolate between start and gradientMidLow
        const t = Math.max(0, (zScore + 2) / 1);
        return `color-mix(in srgb, ${start} ${(1 - t) * 100}%, ${gradientMidLow} ${t * 100}%)`;
      } else if (zScore <= 0) {
        // Between -1 and 0 std dev: interpolate between gradientMidLow and gradientMidHigh
        const t = Math.max(0, zScore + 1);
        return `color-mix(in srgb, ${gradientMidLow} ${(1 - t) * 100}%, ${gradientMidHigh} ${t * 100}%)`;
      } else if (zScore <= 1) {
        // Between 0 and 1 std dev: interpolate between gradientMidHigh and end
        const t = Math.max(0, zScore);
        return `color-mix(in srgb, ${gradientMidHigh} ${(1 - t) * 100}%, ${end} ${t * 100}%)`;
      } else {
        // Above 1 std dev: end
        return end;
      }
    } else if (zScore >= 1) {
      const t = Math.max(0, (2 - zScore) / 1);
      return `color-mix(in srgb, ${start} ${(1 - t) * 100}%, ${gradientMidLow} ${t * 100}%)`;
    } else if (zScore >= 0) {
      const t = Math.max(0, 1 - zScore);
      return `color-mix(in srgb, ${gradientMidLow} ${(1 - t) * 100}%, ${gradientMidHigh} ${t * 100}%)`;
    } else if (zScore >= -1) {
      const t = Math.max(0, -zScore);
      return `color-mix(in srgb, ${gradientMidHigh} ${(1 - t) * 100}%, ${end} ${t * 100}%)`;
    } else {
      return end;
    }
  };

  const renderGradientLegend = () => {
    const leftValue = selectedKPI.higherIsBetter ? minValue : maxValue;
    const rightValue = selectedKPI.higherIsBetter ? maxValue : minValue;

    return (
      <MapLegend
        leftValue={leftValue}
        rightValue={rightValue}
        unit={selectedKPI.unit}
        isBinary={selectedKPI.isBoolean}
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
                        fill: `color-mix(in srgb, ${getColorByValue(value)} 85%, white 20%)`,
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
          unit={selectedKPI.unit}
          total={municipalityData.length}
          nullValue={t(
            `municipalities.list.kpis.${selectedKPI.key}.nullValues`,
          )}
        />
      )}

      {renderGradientLegend()}
      {renderZoomControls()}
    </div>
  );
}

export default SwedenMap;
