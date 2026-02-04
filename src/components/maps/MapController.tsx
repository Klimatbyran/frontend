import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function MapController({
  setPosition,
}: {
  setPosition: (pos: { center: [number, number]; zoom: number }) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const updatePosition = () => {
      const center = map.getCenter();
      setPosition({
        center: [center.lat, center.lng],
        zoom: map.getZoom(),
      });
    };

    map.on("moveend", updatePosition);

    return () => {
      map.off("moveend", updatePosition);
    };
  }, [map, setPosition]);

  return null;
}
