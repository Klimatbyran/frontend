import { useCallback, useState } from "react";

export function useMapPosition(
  defaultCenter: [number, number],
  defaultZoom?: number,
) {
  const getInitialZoom = useCallback(
    () => defaultZoom || 5,
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
