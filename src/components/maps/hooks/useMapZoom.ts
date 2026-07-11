import { useCallback, useRef } from "react";
import type L from "leaflet";
import { fitMapToBounds } from "../mapUtils";

const MIN_ZOOM = 3;
const MAX_ZOOM = 10;

interface UseMapZoomOptions {
  mapBounds?: L.LatLngBounds;
  fitBounds?: boolean;
}

export function useMapZoom(
  defaultCenter: [number, number],
  getInitialZoom: () => number,
  options: UseMapZoomOptions = {},
) {
  const mapRef = useRef<L.Map | null>(null);
  const { mapBounds, fitBounds = false } = options;

  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  }, []);

  const handleReset = useCallback(() => {
    if (!mapRef.current) return;

    if (fitBounds && mapBounds) {
      fitMapToBounds(mapRef.current, mapBounds);
      return;
    }

    mapRef.current.setView(defaultCenter, getInitialZoom());
  }, [defaultCenter, getInitialZoom, fitBounds, mapBounds]);

  return {
    mapRef,
    handleZoomIn,
    handleZoomOut,
    handleReset,
    MIN_ZOOM,
    MAX_ZOOM,
  };
}
