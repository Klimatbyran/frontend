import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { t } from "i18next";

interface Municipality {
  name: string;
  value: number;
  bicycleMetrePerCapita: number;
  historicalEmissionChangePercent: number;
  neededEmissionChangePercent: number;
  hitNetZero: string;
  budgetRunsOut: string;
  electricCarChangePercent: number;
  climatePlanYear: number;
  totalConsumptionEmission: number;
  electricVehiclePerChargePoints: number;
  procurementScore: string;
}

interface DataPoint {
  label: string;
  key: keyof Municipality;
  unit: string;
  description?: string;
  higherIsBetter: boolean;
}

interface SwedenMapProps {
  geoData: JSON;
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
    const width = 200;
    const height = 20;

    // Always show worse values on the left and better values on the right
    const leftValue = selectedDataPoint.higherIsBetter ? minValue : maxValue;
    const rightValue = selectedDataPoint.higherIsBetter ? maxValue : minValue;

    return (
      <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm p-4 rounded-2xl">
        <p className="text-white/70 text-sm mb-2">{selectedDataPoint.label}</p>
        <div className="flex items-center">
          <span className="text-white/50 text-xs mr-2">
            {leftValue.toFixed(1)}
            {selectedDataPoint.unit}
          </span>
          <div
            className="relative"
            style={{ width: `${width}px`, height: `${height}px` }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(to right, ${getColorByValue(leftValue)}, ${getColorByValue(rightValue)})`,
              }}
            />
          </div>
          <span className="text-white/50 text-xs ml-2">
            {rightValue.toFixed(1)}
            {selectedDataPoint.unit}
          </span>
        </div>
      </div>
    );
  };

  const renderZoomControls = () => (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <button
        onClick={handleZoomIn}
        aria-label="Zoom in"
        className="p-2 bg-black/40 backdrop-blur-sm rounded-xl hover:bg-black/60 transition-colors disabled:opacity-50"
        disabled={position.zoom >= 4}
      >
        <ZoomIn className="w-5 h-5 text-white/70" />
      </button>
      <button
        onClick={handleZoomOut}
        aria-label="Zoom out"
        className="p-2 bg-black/40 backdrop-blur-sm rounded-xl hover:bg-black/60 transition-colors disabled:opacity-50"
        disabled={position.zoom <= 0.5}
      >
        <ZoomOut className="w-5 h-5 text-white/70" />
      </button>
      <button
        onClick={handleReset}
        aria-label="Reset zoom"
        className="p-2 bg-black/40 backdrop-blur-sm rounded-xl hover:bg-black/60 transition-colors"
      >
        <RotateCcw className="w-5 h-5 text-white/70" />
      </button>
    </div>
  );

  return (
    <div className="relative flex-1 w-full">
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
        <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm p-4 rounded-2xl">
          <p className="text-white font-medium text-xl">
            {hoveredMunicipality}
          </p>
          {hoveredValue !== null && hoveredRank !== null && (
            <div className="space-y-1 mt-2">
              <p className="text-white/70">
                {selectedDataPoint.label}:{" "}
                <span className="text-[#C6F6D5]">
                  {hoveredValue.toFixed(1)}
                  {selectedDataPoint.unit}
                </span>
              </p>
              <p className="text-white/50 text-sm">
                {t("municipalityList.rank", {
                  rank: String(hoveredRank),
                  total: String(municipalityData.length),
                })}
              </p>
            </div>
          )}
        </div>
      )}

      {renderGradientLegend()}
      {renderZoomControls()}
    </div>
  );
}

export default SwedenMap;
