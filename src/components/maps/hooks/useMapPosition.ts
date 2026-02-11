import { useCallback, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";

export function useMapPosition(
  defaultCenter: [number, number],
  defaultZoom?: number,
) {
  const getInitialZoom = useCallback(
    () => defaultZoom || (isMobile ? 4 : 5),
    [defaultZoom],
  );

  const [position, setPosition] = useState<{
    center: [number, number];
    zoom: number;
  }>({
    center: defaultCenter,
    zoom: getInitialZoom(),
  });

  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        ...prev,
        zoom: getInitialZoom(),
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getInitialZoom]);

  return { position, setPosition, getInitialZoom };
}
