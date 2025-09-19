import React from "react";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import { KPIValue, Municipality } from "@/types/municipality";
import { MapZoomControls } from "./MapZoomControls";
import { MapLegend } from "./MapLegend";
import { MapTooltip } from "./MapTooltip";
import {
  FeatureCollection,
  Feature,
  Geometry,
  GeoJsonProperties,
} from "geojson";
import { MUNICIPALITY_MAP_COLORS } from "./constants";
import { isMobile } from "react-device-detect";
import { t } from "i18next";
import { getSortedMunicipalKPIValues } from "@/utils/data/sorting";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface SwedenMapProps {
  geoData: FeatureCollection;
  municipalityData: Municipality[];
  selectedKPI: KPIValue;
  onMunicipalityClick: (name: string) => void;
}

// Helper component to manage map state
function MapController({
  setPosition,
}: {
  setPosition: (pos: { center: [number, number]; zoom: number }) => void;
}) {
  const map = useMap();

  React.useEffect(() => {
    const updatePosition = () => {
      const center = map.getCenter();
      setPosition({
        center: [center.lat, center.lng],
        zoom: map.getZoom(),
      });
    };

    map.on("moveend", updatePosition);

    return () => {
      map.off("moveend", updatePosition);
    };
  }, [map, setPosition]);

  return null;
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
  const getInitialZoom = () => (isMobile ? 4 : 5);

  const [position, setPosition] = React.useState<{
    center: [number, number];
    zoom: number;
  }>({
    center: [63, 17],
    zoom: getInitialZoom(),
  });

  const mapRef = React.useRef<L.Map | null>(null);

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
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleReset = () => {
    if (mapRef.current) {
      mapRef.current.setView([63, 17], getInitialZoom());
    }
  };

  const getMunicipalityData = React.useCallback(
    (name: string): { value: number | null; rank: number | null } => {
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
    },
    [municipalityData, selectedKPI.key, sortedMunicipalities],
  );

  const getColorByValue = (value: number | null): string => {
    if (value === null) {
      return MUNICIPALITY_MAP_COLORS.null;
    }

    const { gradientStart, gradientMidLow, gradientMidHigh, gradientEnd } =
      MUNICIPALITY_MAP_COLORS;

    if (typeof value === "boolean") {
      return value === true ? gradientEnd : gradientMidLow;
    }

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
        return `color-mix(in srgb, ${gradientStart} ${(1 - t) * 100}%, ${gradientMidLow} ${t * 100}%)`;
      } else if (zScore <= 0) {
        // Between -1 and 0 std dev: interpolate between gradientMidLow and gradientMidHigh
        const t = Math.max(0, zScore + 1);
        return `color-mix(in srgb, ${gradientMidLow} ${(1 - t) * 100}%, ${gradientMidHigh} ${t * 100}%)`;
      } else if (zScore <= 1) {
        // Between 0 and 1 std dev: interpolate between gradientMidHigh and end
        const t = Math.max(0, zScore);
        return `color-mix(in srgb, ${gradientMidHigh} ${(1 - t) * 100}%, ${gradientEnd} ${t * 100}%)`;
      } else {
        // Above 1 std dev: end
        return gradientEnd;
      }
    } else if (zScore >= 1) {
      const t = Math.max(0, (2 - zScore) / 1);
      return `color-mix(in srgb, ${gradientStart} ${(1 - t) * 100}%, ${gradientMidLow} ${t * 100}%)`;
    } else if (zScore >= 0) {
      const t = Math.max(0, 1 - zScore);
      return `color-mix(in srgb, ${gradientMidLow} ${(1 - t) * 100}%, ${gradientMidHigh} ${t * 100}%)`;
    } else if (zScore >= -1) {
      const t = Math.max(0, -zScore);
      return `color-mix(in srgb, ${gradientMidHigh} ${(1 - t) * 100}%, ${gradientEnd} ${t * 100}%)`;
    } else {
      return gradientEnd;
    }
  };

  const renderGradientLegend = () => {
    const leftValue = selectedKPI.higherIsBetter ? minValue : maxValue;
    const rightValue = selectedKPI.higherIsBetter ? maxValue : minValue;

    const hasNullValues = municipalityData.some(
      (m) => m[selectedKPI.key] === null,
    );

    return (
      <MapLegend
        leftValue={leftValue}
        rightValue={rightValue}
        unit={selectedKPI.unit}
        selectedKPI={selectedKPI}
        hasNullValues={hasNullValues}
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

  // Update onEachFeature function to use correct type
  const onEachFeature = (
    feature: Feature<Geometry, GeoJsonProperties> | undefined,
    layer: L.Layer,
  ) => {
    if (feature?.properties?.name) {
      const municipalityName = feature.properties.name;
      const { value, rank } = getMunicipalityData(municipalityName);

      (layer as L.Path).on({
        mouseover: () => {
          setHoveredMunicipality(municipalityName);
          setHoveredValue(value);
          setHoveredRank(rank);
        },
        mouseout: () => {
          setHoveredMunicipality(null);
          setHoveredValue(null);
          setHoveredRank(null);
        },
        click: () => {
          onMunicipalityClick(municipalityName);
        },
      });
    }
  };

  const getMunicipalityStyle = (
    feature: Feature<Geometry, GeoJsonProperties> | undefined,
  ) => {
    if (feature?.properties?.name) {
      const municipalityName = feature.properties.name;
      const { value } = getMunicipalityData(municipalityName);
      const isHovered = hoveredMunicipality === municipalityName;
      const color = getColorByValue(value);

      return {
        fillColor: isHovered
          ? `color-mix(in srgb, ${color} 70%, white 30%)`
          : color,
        weight: 0.75,
        color: "var(--black-1)",
        fillOpacity: 1,
        cursor: "pointer",
      };
    }
    return {};
  };

  React.useEffect(() => {
    if (hoveredMunicipality) {
      const { value, rank } = getMunicipalityData(hoveredMunicipality);
      setHoveredValue(value);
      setHoveredRank(rank);
    }
  }, [selectedKPI, hoveredMunicipality, getMunicipalityData]);

  return (
    <div className="relative flex-1 h-full max-w-screen-lg">
      <MapContainer
        center={position.center}
        zoom={position.zoom}
        style={{
          height: "100%",
          width: "100%",
          backgroundColor: "var(--black-2)",
          zIndex: 0,
        }}
        zoomControl={false}
        attributionControl={false}
        ref={mapRef}
        className="rounded-xl"
      >
        <GeoJSON
          data={geoData}
          style={getMunicipalityStyle}
          onEachFeature={onEachFeature}
        />
        <MapController setPosition={setPosition} />
      </MapContainer>

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
          selectedKPI={selectedKPI}
        />
      )}

      {renderGradientLegend()}
      {renderZoomControls()}
    </div>
  );
}

export default SwedenMap;
