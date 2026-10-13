import { useEffect, useRef } from "react";
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
  const userMoved = useRef(false);
  const fitting = useRef(false);

  useEffect(() => {
    const markMoved = () => {
      if (!fitting.current) userMoved.current = true;
    };
    map.on("dragstart", markMoved);
    map.on("zoomstart", markMoved);
    return () => {
      map.off("dragstart", markMoved);
      map.off("zoomstart", markMoved);
    };
  }, [map]);

  useEffect(() => {
    let frame = 0;
    const fit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        map.invalidateSize();
        if (userMoved.current) return;
        fitting.current = true;
        fitMapToBounds(map, bounds, padding);
        fitting.current = false;
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
