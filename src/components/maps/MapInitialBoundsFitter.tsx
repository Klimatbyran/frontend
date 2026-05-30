import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type L from "leaflet";

interface MapInitialBoundsFitterProps {
  bounds: L.LatLngBounds;
  padding?: L.FitBoundsOptions["padding"];
}

export function MapInitialBoundsFitter({
  bounds,
  padding = 16,
}: MapInitialBoundsFitterProps) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(bounds, { padding, animate: false });
  }, [map, bounds, padding]);

  return null;
}
