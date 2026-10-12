import { useCallback, useMemo, useRef, useState } from "react";
import { Feature, Geometry, GeoJsonProperties } from "geojson";
import L from "leaflet";
import { DataItem, DataKPI } from "@/types/rankings";
import {
  getTerritoryKpiRawValue,
  getTerritoryMapFillColor,
  TerritoryMapGradientColors,
} from "@/utils/territoryMapUtils";
import { isMobile } from "react-device-detect";

interface UseMapInteractionsProps {
  data: DataItem[];
  selectedKPI: DataKPI;
  sortedData: DataItem[];
  values: number[];
  propertyNameField: string;
  gradientColors: TerritoryMapGradientColors;
  booleanColors: { positive: string; negative: string };
  onAreaClick?: (id: string) => void;
  hoveredArea?: string | null;
  onHoveredAreaChange?: (area: string | null) => void;
  showTooltip?: boolean;
}

type AreaFeature = Feature<Geometry, GeoJsonProperties>;

function areaPathStyle(fillColor: string, hovered: boolean): L.PathOptions {
  return {
    fillColor: hovered
      ? `color-mix(in srgb, ${fillColor} 70%, white 30%)`
      : fillColor,
    weight: 0.75,
    color: "var(--black-1)",
    fillOpacity: 1,
    cursor: "pointer",
  };
}

export function useMapInteractions({
  data,
  selectedKPI,
  sortedData,
  values,
  propertyNameField,
  gradientColors,
  booleanColors,
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

  const { value: hoveredValue, rank: hoveredRank } = useMemo(
    () =>
      hoveredArea ? getAreaData(hoveredArea) : { value: null, rank: null },
    [hoveredArea, getAreaData],
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
        gradientColors,
        booleanColors,
      );
    },
    [values, gradientColors, booleanColors, selectedKPI],
  );

  // Uncontrolled hover is applied on the path in mouse handlers so overview
  // maps do not restyle every polygon on each hover. Controlled hover (list↔map
  // sync on detail pages) stays in the style callback — those maps are small.
  const getAreaStyle = useCallback(
    (feature: AreaFeature | undefined) => {
      if (!feature?.properties?.[propertyNameField]) {
        return {};
      }

      const areaName = String(feature.properties[propertyNameField]);
      const { value } = getAreaData(areaName);
      const isHovered =
        isControlled &&
        !!hoveredArea &&
        hoveredArea.toLowerCase() === areaName.toLowerCase();
      return areaPathStyle(getColorByValue(value), isHovered);
    },
    [
      propertyNameField,
      getAreaData,
      getColorByValue,
      isControlled,
      isControlled ? hoveredArea : null,
    ],
  );

  const getColorByValueRef = useRef(getColorByValue);
  getColorByValueRef.current = getColorByValue;

  const getAreaDataRef = useRef(getAreaData);
  getAreaDataRef.current = getAreaData;

  const onAreaClickRef = useRef(onAreaClick);
  onAreaClickRef.current = onAreaClick;

  const setHoveredAreaRef = useRef(setHoveredArea);
  setHoveredAreaRef.current = setHoveredArea;

  const showTooltipRef = useRef(showTooltip);
  showTooltipRef.current = showTooltip;

  const onEachFeature = useCallback(
    (feature: AreaFeature | undefined, layer: L.Layer) => {
      if (!feature?.properties?.[propertyNameField]) {
        return;
      }

      const areaName = String(feature.properties[propertyNameField]);
      const pathLayer = layer as L.Path;

      const applyHover = (hovered: boolean) => {
        const { value } = getAreaDataRef.current(areaName);
        pathLayer.setStyle(
          areaPathStyle(getColorByValueRef.current(value), hovered),
        );
      };

      pathLayer.on({
        mouseover: () => {
          if (!isMobile) {
            setHoveredAreaRef.current(areaName);
            applyHover(true);
          }
        },
        mouseout: () => {
          if (!isMobile) {
            setHoveredAreaRef.current(null);
            applyHover(false);
          }
        },
        click: () => {
          if (showTooltipRef.current) {
            setHoveredAreaRef.current(areaName);
            applyHover(true);
          }
          // Detail maps disable tooltips; still allow tap-to-navigate on mobile.
          if (
            onAreaClickRef.current &&
            (!isMobile || !showTooltipRef.current)
          ) {
            onAreaClickRef.current(areaName);
          }
        },
      });
    },
    [propertyNameField],
  );

  return {
    hoveredArea,
    hoveredValue,
    hoveredRank,
    getAreaStyle,
    onEachFeature,
  };
}
