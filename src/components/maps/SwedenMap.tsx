import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { KPIValue } from "@/types/entity-rankings";

export interface DataKPI {
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
  selectedKPI,
  onAreaClick = () => {},
  defaultCenter = [63, 17],
  defaultZoom,
  propertyNameField = "name",
  colors = MUNICIPALITY_MAP_COLORS,
}: SwedenMapProps) {
  const [hoveredArea, setHoveredArea] = React.useState<string | null>(null);
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

  const values = useMemo(() => {
    if (!selectedKPI) {
      return [];
    }

    return data
      .map((item) => item[selectedKPI.key])
      .filter(
        (val): val is number | string => val !== null && val !== undefined,
      )
      .map(Number)
      .filter((val) => Number.isFinite(val));
  }, [data, selectedKPI]);

  const minValue = values.length ? Math.min(...values) : 0;
  const maxValue = values.length ? Math.max(...values) : 0;

  const sortedData = useMemo(() => {
    if (!selectedKPI) {
      return [];
    }

    return [...data].sort((a, b) => {
      const aVal = a[selectedKPI.key];
      const bVal = b[selectedKPI.key];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const numericA = Number(aVal) || 0;
      const numericB = Number(bVal) || 0;

      return selectedKPI.higherIsBetter
        ? numericB - numericA
        : numericA - numericB;
    });
  }, [data, selectedKPI]);

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

  const getAreaData = useCallback(
    (name: string): { value: number | boolean | null; rank: number | null } => {
      if (!selectedKPI) {
        return { value: null, rank: null };
      }

      const normalizedTargetName = name?.toLowerCase();
      const item = data.find(
        (d) =>
          typeof d?.name === "string" &&
          d.name.toLowerCase() === normalizedTargetName,
      );

      if (!item) {
        return { value: null, rank: null };
      }

      let value: number | boolean | null = null;
      const rawValue = item[selectedKPI.key];
      if (typeof rawValue === "number" || typeof rawValue === "boolean") {
        value = rawValue;
      } else if (rawValue !== null && rawValue !== undefined) {
        const numericValue = Number(rawValue);
        value = Number.isFinite(numericValue) ? numericValue : null;
      }

      const rankIndex = sortedData.findIndex((d) => d.name === item.name);
      const rank = rankIndex >= 0 ? rankIndex + 1 : null;

      return { value, rank };
    },
    [data, selectedKPI, sortedData],
  );

  const getColorByValue = (value: number | boolean | null): string => {
    if (
      value === null ||
      value === undefined ||
      !selectedKPI ||
      values.length === 0
    ) {
      return colors.null;
    }

    const { gradientStart, gradientMidLow, gradientMidHigh, gradientEnd } =
      colors;

    if (typeof value === "boolean") {
      return value === true ? gradientEnd : gradientMidLow;
    }

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    const stdDev = Math.sqrt(variance);
    const safeStdDev = stdDev === 0 ? 1 : stdDev;
    const zScore = (value - mean) / safeStdDev;

    if (selectedKPI.higherIsBetter) {
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
    const leftValue = selectedKPI.higherIsBetter ? minValue : maxValue;
    const rightValue = selectedKPI.higherIsBetter ? maxValue : minValue;

    const hasNullValues = data.some((item) => item[selectedKPI.key] === null);

    return (
      <MapLegend
        leftValue={leftValue}
        rightValue={rightValue}
        unit={selectedKPI.unit ?? ""}
        selectedKPI={selectedKPI as KPIValue}
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
      const areaName = feature.properties[propertyNameField];
      const { value, rank } = getAreaData(areaName);

      (layer as L.Path).on({
        mouseover: () => {
          setHoveredArea(areaName);
          setHoveredValue(value);
          setHoveredRank(rank);
        },
        mouseout: () => {
          setHoveredArea(null);
          setHoveredValue(null);
          setHoveredRank(null);
        },
        click: () => {
          if (onAreaClick) onAreaClick(areaName);
        },
      });
    }
  };

  const getAreaStyle = (
    feature: Feature<Geometry, GeoJsonProperties> | undefined,
  ) => {
    if (feature?.properties?.[propertyNameField]) {
      const areaName = feature.properties[propertyNameField];
      const { value } = getAreaData(areaName);
      const isHovered = hoveredArea === areaName;
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
    if (!hoveredArea || !selectedKPI) {
      setHoveredValue(null);
      setHoveredRank(null);
      return;
    }

    const { value, rank } = getAreaData(hoveredArea);
    setHoveredValue(value);
    setHoveredRank(rank);
  }, [hoveredArea, selectedKPI, getAreaData]);

  if (!selectedKPI) {
    return (
      <div className="relative flex-1 h-full max-w-screen-lg flex items-center justify-center">
        <div className="text-white/70">No KPI selected</div>
      </div>
    );
  }

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
          style={getAreaStyle}
          onEachFeature={onEachFeature}
        />
        <MapController setPosition={setPosition} />
      </MapContainer>

      {hoveredArea && (
        <MapTooltip
          name={hoveredArea}
          value={hoveredValue}
          rank={hoveredRank}
          unit={selectedKPI.unit ?? ""}
          total={data.length}
          nullValue={
            selectedKPI.key && t
              ? t(`municipalities.list.kpis.${selectedKPI.key}.nullValues`)
              : "No data"
          }
          selectedKPI={selectedKPI as KPIValue}
        />
      )}

      {renderGradientLegend()}
      {renderZoomControls()}
    </div>
  );
}

export default MapOfSweden;
