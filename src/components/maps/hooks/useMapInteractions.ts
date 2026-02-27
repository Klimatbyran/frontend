import { useCallback, useEffect, useState } from "react";
import { Feature, Geometry, GeoJsonProperties } from "geojson";
import L from "leaflet";
import { DataItem, DataKPI } from "@/types/rankings";
import { createStatisticalGradient } from "@/utils/ui/colorGradients";
import { isMobile } from "react-device-detect";

interface UseMapInteractionsProps {
  data: DataItem[];
  selectedKPI: DataKPI;
  sortedData: DataItem[];
  values: number[];
  propertyNameField: string;
  colors: {
    null: string;
    gradientStart: string;
    gradientMidLow: string;
    gradientMidHigh: string;
    gradientEnd: string;
  };
}

export function useMapInteractions({
  data,
  selectedKPI,
  sortedData,
  values,
  propertyNameField,
  colors,
}: UseMapInteractionsProps) {
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  const [hoveredValue, setHoveredValue] = useState<number | boolean | null>(
    null,
  );
  const [hoveredRank, setHoveredRank] = useState<number | null>(null);

  const getAreaData = useCallback(
    (name: string): { value: number | boolean | null; rank: number | null } => {
      if (!selectedKPI) {
        return { value: null, rank: null };
      }

      const item = data.find(
        (d) => d.name && d.name.toLowerCase() === name.toLowerCase(),
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

      const rankIndex = sortedData.findIndex(
        (d) => d.name && item.name && d.name === item.name,
      );
      const rank = rankIndex >= 0 ? rankIndex + 1 : null;

      return { value, rank };
    },
    [data, selectedKPI, sortedData],
  );

  const getColorByValue = useCallback(
    (value: number | boolean | null): string => {
      if (
        value === null ||
        value === undefined ||
        values.length === 0 ||
        Number.isNaN(value)
      ) {
        return colors.null;
      }

      const { gradientMidLow, gradientEnd } = colors;

      if (typeof value === "boolean") {
        return value === true ? gradientEnd : gradientMidLow;
      }

      return createStatisticalGradient(
        values,
        value,
        selectedKPI.higherIsBetter ?? false,
        colors,
      );
    },
    [values, colors, selectedKPI],
  );

  const getAreaStyle = useCallback(
    (feature: Feature<Geometry, GeoJsonProperties> | undefined) => {
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
    },
    [propertyNameField, getAreaData, getColorByValue, hoveredArea],
  );

  const onEachFeature = useCallback(
    (
      feature: Feature<Geometry, GeoJsonProperties> | undefined,
      layer: L.Layer,
    ) => {
      if (feature?.properties?.[propertyNameField]) {
        const areaName = feature.properties[propertyNameField];

        (layer as L.Path).on({
          mouseover: () => {
            if (!isMobile) {
              setHoveredArea(areaName);
            }
          },
          mouseout: () => {
            if (!isMobile) {
              setHoveredArea(null);
              setHoveredValue(null);
              setHoveredRank(null);
            }
          },
          click: () => {
            // On any device, clicking an area should show its tooltip.
            setHoveredArea(areaName);
          },
        });
      }
    },
    [propertyNameField],
  );

  useEffect(() => {
    if (!hoveredArea) {
      setHoveredValue(null);
      setHoveredRank(null);
      return;
    }

    const { value, rank } = getAreaData(hoveredArea);
    setHoveredValue(value);
    setHoveredRank(rank);
  }, [hoveredArea, getAreaData]);

  return {
    hoveredArea,
    hoveredValue,
    hoveredRank,
    getAreaStyle,
    onEachFeature,
  };
}
