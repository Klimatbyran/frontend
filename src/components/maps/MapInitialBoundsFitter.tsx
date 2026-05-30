import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type L from "leaflet";
import { MAP_FIT_BOUNDS_PADDING } from "../mapConstants";

interface MapInitialBoundsFitterProps {
  bounds: L.LatLngBounds;
  padding?: L.FitBoundsOptions["padding"];
}

export function MapInitialBoundsFitter({
  bounds,
  padding = MAP_FIT_BOUNDS_PADDING,
}: MapInitialBoundsFitterProps) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(bounds, { padding, animate: false });
  }, [map, bounds, padding]);

  return null;
}
