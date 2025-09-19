import React, { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";
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
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { KPIValue } from "@/types/municipality";

export interface DataAttribute {
  key: string;
  label: string;
  unit?: string;
  higherIsBetter?: boolean;
  format?: (value: number | string | boolean | null) => string;
}

export interface DataItem {
  id: string;
  name: string;
  [key: string]: string | number | boolean | null | undefined | Array<unknown>;
}

interface SwedenMapProps {
  geoData: FeatureCollection;
  data: DataItem[];
  selectedAttribute: DataAttribute;
  onRegionClick: (id: string) => void;
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

function MapController({
  setPosition,
}: {
  setPosition: (pos: { center: [number, number]; zoom: number }) => void;
}) {
  const map = useMap();

  useEffect(() => {
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

function MapOfSweden({
  geoData,
  data,
  selectedAttribute,
  onRegionClick,
  defaultCenter = [63, 17],
  defaultZoom,
  propertyNameField = "name",
  colors = MUNICIPALITY_MAP_COLORS,
}: SwedenMapProps) {
  const [hoveredRegion, setHoveredRegion] = React.useState<string | null>(null);
  const [hoveredValue, setHoveredValue] = useState<number | boolean | null>(
    null,
  );
  const [hoveredRank, setHoveredRank] = useState<number | null>(null);

  const getInitialZoom = useCallback(
    () => defaultZoom || (isMobile ? 4 : 5),
    [defaultZoom],
  );

  const [position, setPosition] = useState<{
    center: [number, number];
    zoom: number;
  }>({
    center: defaultCenter,
    zoom: getInitialZoom(),
  });

  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        ...prev,
        zoom: getInitialZoom(),
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getInitialZoom]);

  const values = data
    .map((item) => item[selectedAttribute.key])
    .filter((val) => val !== null && val !== undefined)
    .map(Number);

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Sort data by selected attribute
  const sortedData = [...data].sort((a, b) => {
    const aVal = a[selectedAttribute.key];
    const bVal = b[selectedAttribute.key];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    return selectedAttribute.higherIsBetter
      ? (Number(bVal) || 0) - (Number(aVal) || 0)
      : (Number(aVal) || 0) - (Number(bVal) || 0);
  });

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
      mapRef.current.setView(defaultCenter, getInitialZoom());
    }
  };

  const getRegionData = useCallback(
    (name: string): { value: number | boolean | null; rank: number | null } => {
      const item = data.find(
        (d) => d.name.toLowerCase() === name.toLowerCase(),
      );

      if (!item) {
        return { value: null, rank: null };
      }

      let value: number | boolean | null = null;
      const rawValue = item[selectedAttribute.key];
      if (typeof rawValue === "number" || typeof rawValue === "boolean") {
        value = rawValue;
      }
      const rank = sortedData.findIndex((d) => d.name === item.name) + 1;

      return { value, rank };
    },
    [data, selectedAttribute.key, sortedData],
  );

  const getColorByValue = (value: number | boolean | null): string => {
    if (value === null || value === undefined) {
      return colors.null;
    }

    const { gradientStart, gradientMidLow, gradientMidHigh, gradientEnd } =
      colors;

    if (typeof value === "boolean") {
      return value === true ? gradientEnd : gradientMidLow;
    }

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        values.length,
    );

    const zScore = (value - mean) / stdDev;

    if (selectedAttribute.higherIsBetter) {
      if (zScore <= -1) {
        const t = Math.max(0, (zScore + 2) / 1);
        return `color-mix(in srgb, ${gradientStart} ${(1 - t) * 100}%, ${gradientMidLow} ${t * 100}%)`;
      } else if (zScore <= 0) {
        const t = Math.max(0, zScore + 1);
        return `color-mix(in srgb, ${gradientMidLow} ${(1 - t) * 100}%, ${gradientMidHigh} ${t * 100}%)`;
      } else if (zScore <= 1) {
        const t = Math.max(0, zScore);
        return `color-mix(in srgb, ${gradientMidHigh} ${(1 - t) * 100}%, ${gradientEnd} ${t * 100}%)`;
      } else {
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
    const leftValue = selectedAttribute.higherIsBetter ? minValue : maxValue;
    const rightValue = selectedAttribute.higherIsBetter ? maxValue : minValue;

    const hasNullValues = data.some(
      (item) => item[selectedAttribute.key] === null,
    );

    return (
      <MapLegend
        leftValue={leftValue}
        rightValue={rightValue}
        unit={selectedAttribute.unit ?? ""}
        selectedKPI={selectedAttribute as KPIValue}
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

  const onEachFeature = (
    feature: Feature<Geometry, GeoJsonProperties> | undefined,
    layer: L.Layer,
  ) => {
    if (feature?.properties?.[propertyNameField]) {
      const regionName = feature.properties[propertyNameField];
      const { value, rank } = getRegionData(regionName);

      (layer as L.Path).on({
        mouseover: () => {
          setHoveredRegion(regionName);
          setHoveredValue(value);
          setHoveredRank(rank);
        },
        mouseout: () => {
          setHoveredRegion(null);
          setHoveredValue(null);
          setHoveredRank(null);
        },
        click: () => {
          onRegionClick(regionName);
        },
      });
    }
  };

  const getRegionStyle = (
    feature: Feature<Geometry, GeoJsonProperties> | undefined,
  ) => {
    if (feature?.properties?.[propertyNameField]) {
      const regionName = feature.properties[propertyNameField];
      const { value } = getRegionData(regionName);
      const isHovered = hoveredRegion === regionName;
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

  useEffect(() => {
    if (hoveredRegion) {
      const { value, rank } = getRegionData(hoveredRegion);
      setHoveredValue(value);
      setHoveredRank(rank);
    }
  }, [selectedAttribute, hoveredRegion, getRegionData]);

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
          style={getRegionStyle}
          onEachFeature={onEachFeature}
        />
        <MapController setPosition={setPosition} />
      </MapContainer>

      {hoveredRegion && (
        <MapTooltip
          name={hoveredRegion}
          value={hoveredValue}
          rank={hoveredRank}
          unit={selectedAttribute.unit ?? ""}
          total={data.length}
          nullValue={
            selectedAttribute.key && t
              ? t(
                  `municipalities.list.kpis.${selectedAttribute.key}.nullValues`,
                )
              : "No data"
          }
          selectedKPI={selectedAttribute as KPIValue}
        />
      )}

      {renderGradientLegend()}
      {renderZoomControls()}
    </div>
  );
}

export default MapOfSweden;
