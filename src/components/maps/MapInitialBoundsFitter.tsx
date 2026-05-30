import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type L from "leaflet";
import { MAP_FIT_BOUNDS_PADDING } from "./mapConstants";
import { fitMapToBounds } from "./mapUtils";

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
    fitMapToBounds(map, bounds, padding);
  }, [map, bounds, padding]);

  return null;
}
