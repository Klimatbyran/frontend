import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type L from "leaflet";
import { MAP_FIT_BOUNDS_PADDING } from "./mapConstants";
import { fitMapToBounds, type FitBoundsPadding } from "./mapUtils";

interface MapInitialBoundsFitterProps {
  bounds: L.LatLngBounds;
  padding?: FitBoundsPadding;
}

export function MapInitialBoundsFitter({
  bounds,
  padding = MAP_FIT_BOUNDS_PADDING,
}: MapInitialBoundsFitterProps) {
  const map = useMap();

  useEffect(() => {
    let frame = 0;
    const fit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        map.invalidateSize();
        fitMapToBounds(map, bounds, padding);
      });
    };

    fit();

    const observer = new ResizeObserver(() => {
      fit();
    });
    observer.observe(map.getContainer());

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [map, bounds, padding]);

  return null;
}
