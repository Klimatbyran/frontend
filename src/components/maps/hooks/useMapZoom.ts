import { useCallback, useRef } from "react";
import type L from "leaflet";

const MIN_ZOOM = 3;
const MAX_ZOOM = 10;

export function useMapZoom(
  defaultCenter: [number, number],
  getInitialZoom: () => number,
) {
  const mapRef = useRef<L.Map | null>(null);

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
    if (mapRef.current) {
      mapRef.current.setView(defaultCenter, getInitialZoom());
    }
  }, [defaultCenter, getInitialZoom]);

  return {
    mapRef,
    handleZoomIn,
    handleZoomOut,
    handleReset,
    MIN_ZOOM,
    MAX_ZOOM,
  };
}
