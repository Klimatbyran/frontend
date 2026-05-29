import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type L from "leaflet";

interface MapBoundsFitterProps {
  bounds: L.LatLngBounds;
  padding?: L.FitBoundsOptions["padding"];
}

export function MapBoundsFitter({
  bounds,
  padding = 16,
}: MapBoundsFitterProps) {
  const map = useMap();

  useEffect(() => {
    const fitMap = () => {
      map.fitBounds(bounds, { padding, animate: false });
    };

    fitMap();
    map.on("resize", fitMap);

    return () => {
      map.off("resize", fitMap);
    };
  }, [map, bounds, padding]);

  return null;
}
