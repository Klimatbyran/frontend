import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import type L from "leaflet";
import { MAP_FIT_BOUNDS_PADDING } from "./mapConstants";
import { fitMapToBounds, type MapFitBoundsPadding } from "./mapUtils";

interface MapInitialBoundsFitterProps {
  bounds: L.LatLngBounds;
  padding?: MapFitBoundsPadding;
}

export function MapInitialBoundsFitter({
  bounds,
  padding = MAP_FIT_BOUNDS_PADDING,
}: MapInitialBoundsFitterProps) {
  const map = useMap();
  const lastFittedBoundsKey = useRef<string | null>(null);

  useEffect(() => {
    const fit = () => {
      const size = map.getSize();
      if (size.x < 1 || size.y < 1) return;

      const boundsKey = bounds.toBBoxString();
      const paddingKey = JSON.stringify(padding);
      const sizeKey = `${Math.round(size.x)}x${Math.round(size.y)}`;
      const fitKey = `${boundsKey}:${paddingKey}:${sizeKey}`;
      if (lastFittedBoundsKey.current === fitKey) return;

      lastFittedBoundsKey.current = fitKey;
      fitMapToBounds(map, bounds, padding);
    };

    fit();
    const frame = requestAnimationFrame(fit);
    map.on("resize", fit);
    return () => {
      cancelAnimationFrame(frame);
      map.off("resize", fit);
    };
  }, [map, bounds, padding]);

  return null;
}
