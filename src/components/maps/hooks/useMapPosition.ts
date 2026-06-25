import { useCallback, useState } from "react";
import { isMobile } from "react-device-detect";

export function useMapPosition(
  defaultCenter: [number, number],
  defaultZoom?: number,
) {
  const getInitialZoom = useCallback(
    () => defaultZoom || (isMobile ? 3 : 4),
    [defaultZoom],
  );

  const [position, setPosition] = useState<{
    center: [number, number];
    zoom: number;
  }>({
    center: defaultCenter,
    zoom: getInitialZoom(),
  });

  return { position, setPosition, getInitialZoom };
}
