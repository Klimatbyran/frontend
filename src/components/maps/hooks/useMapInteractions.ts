import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
type PathWithFeature = L.Path & { feature?: AreaFeature };

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

function isSameAreaName(a: string | null | undefined, b: string): boolean {
  return a?.toLowerCase() === b.toLowerCase();
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

  const computeAreaStyle = useCallback(
    (feature: AreaFeature | undefined, hoveredName: string | null) => {
      if (!feature?.properties?.[propertyNameField]) {
        return {};
      }

      const areaName = String(feature.properties[propertyNameField]);
      const { value } = getAreaData(areaName);
      return areaPathStyle(
        getColorByValue(value),
        isSameAreaName(hoveredName, areaName),
      );
    },
    [propertyNameField, getAreaData, getColorByValue],
  );

  const computeAreaStyleRef = useRef(computeAreaStyle);
  computeAreaStyleRef.current = computeAreaStyle;

  const hoveredAreaRef = useRef(hoveredArea);
  hoveredAreaRef.current = hoveredArea;

  const onAreaClickRef = useRef(onAreaClick);
  onAreaClickRef.current = onAreaClick;

  const setHoveredAreaRef = useRef(setHoveredArea);
  setHoveredAreaRef.current = setHoveredArea;

  const showTooltipRef = useRef(showTooltip);
  showTooltipRef.current = showTooltip;

  const layersByNameRef = useRef(new Map<string, PathWithFeature>());
  const stickyHoverRef = useRef<string | null>(null);

  // Stable identity: react-leaflet only calls setStyle when `style` changes
  // reference. KPI/hover updates go through the layer map below instead, so
  // overview maps do not restyle every polygon on each React render.
  const getAreaStyle = useCallback((feature: AreaFeature | undefined) => {
    return computeAreaStyleRef.current(feature, hoveredAreaRef.current);
  }, []);

  const findLayer = useCallback((name: string | null | undefined) => {
    if (!name) return undefined;
    const direct = layersByNameRef.current.get(name);
    if (direct) {
      return { layer: direct, areaName: name };
    }
    const lower = name.toLowerCase();
    for (const [areaName, layer] of layersByNameRef.current) {
      if (areaName.toLowerCase() === lower) {
        return { layer, areaName };
      }
    }
    return undefined;
  }, []);

  const applyLayerStyle = useCallback(
    (areaName: string, hovered: boolean) => {
      const found = findLayer(areaName);
      if (!found) return;
      const feature = found.layer.feature;
      found.layer.setStyle(
        computeAreaStyleRef.current(
          feature,
          hovered ? found.areaName : null,
        ) as L.PathOptions,
      );
    },
    [findLayer],
  );

  const refreshAllLayerStyles = useCallback(() => {
    layersByNameRef.current.forEach((layer, areaName) => {
      const hovered =
        isSameAreaName(hoveredAreaRef.current, areaName) ||
        isSameAreaName(stickyHoverRef.current, areaName);
      layer.setStyle(
        computeAreaStyleRef.current(
          layer.feature,
          hovered ? areaName : null,
        ) as L.PathOptions,
      );
    });
  }, []);

  useEffect(() => {
    refreshAllLayerStyles();
  }, [
    refreshAllLayerStyles,
    selectedKPI.key,
    selectedKPI.higherIsBetter,
    selectedKPI.isBoolean,
    values,
    gradientColors,
    booleanColors,
    data,
  ]);

  // Controlled list↔map hover: only touch the previous and next area layers.
  const prevHoveredRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isControlled) return;

    const prev = prevHoveredRef.current;
    const next = hoveredArea ?? null;
    if (prev === next) return;

    if (prev && !isSameAreaName(stickyHoverRef.current, prev)) {
      applyLayerStyle(prev, false);
    }
    if (next) {
      applyLayerStyle(next, true);
    }

    prevHoveredRef.current = next;
  }, [hoveredArea, isControlled, applyLayerStyle]);

  const clearStickyHover = useCallback(() => {
    const prev = stickyHoverRef.current;
    stickyHoverRef.current = null;
    if (prev) {
      applyLayerStyle(prev, false);
    }
  }, [applyLayerStyle]);

  const onEachFeature = useCallback(
    (feature: AreaFeature | undefined, layer: L.Layer) => {
      if (!feature?.properties?.[propertyNameField]) {
        return;
      }

      const areaName = String(feature.properties[propertyNameField]);
      const pathLayer = layer as PathWithFeature;
      pathLayer.feature = feature;
      layersByNameRef.current.set(areaName, pathLayer);

      pathLayer.on({
        mouseover: () => {
          if (!isMobile) {
            setHoveredAreaRef.current(areaName);
            pathLayer.setStyle(
              computeAreaStyleRef.current(feature, areaName) as L.PathOptions,
            );
          }
        },
        mouseout: () => {
          if (!isMobile) {
            setHoveredAreaRef.current(null);
            const keepSticky = isSameAreaName(stickyHoverRef.current, areaName);
            pathLayer.setStyle(
              computeAreaStyleRef.current(
                feature,
                keepSticky ? areaName : null,
              ) as L.PathOptions,
            );
          }
        },
        click: () => {
          if (showTooltipRef.current) {
            // Mobile has no mouseout — reset the previous tap highlight first.
            if (
              stickyHoverRef.current &&
              !isSameAreaName(stickyHoverRef.current, areaName)
            ) {
              clearStickyHover();
            }
            stickyHoverRef.current = areaName;
            setHoveredAreaRef.current(areaName);
            pathLayer.setStyle(
              computeAreaStyleRef.current(feature, areaName) as L.PathOptions,
            );
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
    [propertyNameField, clearStickyHover],
  );

  return {
    hoveredArea,
    hoveredValue,
    hoveredRank,
    getAreaStyle,
    onEachFeature,
  };
}
