import { useCallback, useEffect, useState } from "react";
import { Feature, Geometry, GeoJsonProperties } from "geojson";
import L from "leaflet";
import { DataItem, DataKPI } from "@/types/rankings";
import {
  getTerritoryKpiRawValue,
  getTerritoryMapFillColor,
} from "@/utils/territoryMapUtils";
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
  onAreaClick?: (id: string) => void;
  hoveredArea?: string | null;
  onHoveredAreaChange?: (area: string | null) => void;
  showTooltip?: boolean;
}

export function useMapInteractions({
  data,
  selectedKPI,
  sortedData,
  values,
  propertyNameField,
  colors,
  onAreaClick,
  hoveredArea: controlledHoveredArea,
  onHoveredAreaChange,
  showTooltip = true,
}: UseMapInteractionsProps) {
  const [uncontrolledHoveredArea, setUncontrolledHoveredArea] = useState<
    string | null
  >(null);

  const isControlled =
    controlledHoveredArea !== undefined && onHoveredAreaChange !== undefined;
  const hoveredArea = isControlled
    ? controlledHoveredArea
    : uncontrolledHoveredArea;

  const setHoveredArea = useCallback(
    (area: string | null) => {
      if (isControlled) {
        onHoveredAreaChange(area);
        return;
      }

      setUncontrolledHoveredArea(area);
    },
    [isControlled, onHoveredAreaChange],
  );
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

      const value = getTerritoryKpiRawValue(item, String(selectedKPI.key));

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
      return getTerritoryMapFillColor(
        value,
        values,
        {
          higherIsBetter: selectedKPI.higherIsBetter,
          isBoolean:
            "isBoolean" in selectedKPI
              ? Boolean(selectedKPI.isBoolean)
              : undefined,
        },
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
        const isHovered =
          hoveredArea?.toLowerCase() === String(areaName).toLowerCase();
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
            if (showTooltip) {
              setHoveredArea(areaName);
            }
            if (!isMobile && onAreaClick) {
              onAreaClick(areaName);
            }
          },
        });
      }
    },
    [propertyNameField, onAreaClick, setHoveredArea, showTooltip],
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
