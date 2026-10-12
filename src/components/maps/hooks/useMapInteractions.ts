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
    (
      feature: AreaFeature | undefined,
      hoveredName: string | null,
    ): L.PathOptions | Record<string, unknown> => {
      if (!feature?.properties?.[propertyNameField]) {
        return {};
      }

      const areaName = String(feature.properties[propertyNameField]);
      const { value } = getAreaData(areaName);
      const isHovered = isSameAreaName(hoveredName, areaName);
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

  const layersByNameRef = useRef(new Map<string, L.Path>());

  /**
   * Stable style callback so react-leaflet does not call setStyle on every
   * render/hover. KPI and hover updates apply styles through layer refs below.
   */
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

  const refreshAllLayerStyles = useCallback(() => {
    layersByNameRef.current.forEach((layer) => {
      const feature = (layer as L.Path & { feature?: AreaFeature }).feature;
      layer.setStyle(
        computeAreaStyleRef.current(
          feature,
          hoveredAreaRef.current,
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

  // List↔map hover sync: only touch the previous and next area layers.
  const prevHoveredRef = useRef<string | null>(null);
  useEffect(() => {
    const prev = prevHoveredRef.current;
    const next = hoveredArea ?? null;
    if (prev === next) return;

    if (prev) {
      const found = findLayer(prev);
      if (found) {
        const feature = (found.layer as L.Path & { feature?: AreaFeature })
          .feature;
        found.layer.setStyle(
          computeAreaStyleRef.current(feature, null) as L.PathOptions,
        );
      }
    }

    if (next) {
      const found = findLayer(next);
      if (found) {
        const feature = (found.layer as L.Path & { feature?: AreaFeature })
          .feature;
        found.layer.setStyle(
          computeAreaStyleRef.current(
            feature,
            found.areaName,
          ) as L.PathOptions,
        );
      }
    }

    prevHoveredRef.current = next;
  }, [hoveredArea, findLayer]);

  const onEachFeature = useCallback(
    (feature: AreaFeature | undefined, layer: L.Layer) => {
      if (!feature?.properties?.[propertyNameField]) {
        return;
      }

      const areaName = String(feature.properties[propertyNameField]);
      const pathLayer = layer as L.Path & { feature?: AreaFeature };
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
            pathLayer.setStyle(
              computeAreaStyleRef.current(feature, null) as L.PathOptions,
            );
          }
        },
        click: () => {
          if (showTooltipRef.current) {
            setHoveredAreaRef.current(areaName);
            pathLayer.setStyle(
              computeAreaStyleRef.current(feature, areaName) as L.PathOptions,
            );
          }
          // Detail maps disable tooltips; still allow tap-to-navigate on mobile.
          if (onAreaClickRef.current && (!isMobile || !showTooltipRef.current)) {
            onAreaClickRef.current(areaName);
          }
        },
      });
    },
    [propertyNameField],
  );

  useEffect(() => {
    return () => {
      layersByNameRef.current.clear();
    };
  }, []);

  return {
    hoveredArea,
    hoveredValue,
    hoveredRank,
    getAreaStyle,
    onEachFeature,
  };
}
