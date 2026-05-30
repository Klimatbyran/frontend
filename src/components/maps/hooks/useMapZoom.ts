import { useCallback, useRef } from "react";
import type L from "leaflet";

const MIN_ZOOM = 3;
const MAX_ZOOM = 10;

interface UseMapZoomOptions {
  mapBounds?: L.LatLngBounds;
  fitBoundsOnReset?: boolean;
}

export function useMapZoom(
  defaultCenter: [number, number],
  getInitialZoom: () => number,
  options: UseMapZoomOptions = {},
) {
  const mapRef = useRef<L.Map | null>(null);
  const { mapBounds, fitBoundsOnReset = false } = options;

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

    if (fitBoundsOnReset && mapBounds) {
      mapRef.current.fitBounds(mapBounds, {
        padding: [20, 20],
        animate: false,
      });
      return;
    }

    mapRef.current.setView(defaultCenter, getInitialZoom());
  }, [defaultCenter, getInitialZoom, fitBoundsOnReset, mapBounds]);

  return {
    mapRef,
    handleZoomIn,
    handleZoomOut,
    handleReset,
    MIN_ZOOM,
    MAX_ZOOM,
  };
}
