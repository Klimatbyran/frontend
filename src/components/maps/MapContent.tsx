import {
  FeatureCollection,
  Feature,
  Geometry,
  GeoJsonProperties,
} from "geojson";
import {
  useEffect,
  useId,
  useMemo,
  useState,
  type MutableRefObject,
} from "react";
import { MapContainer, GeoJSON } from "react-leaflet";
import type L from "leaflet";
import { MapController } from "./MapController";
import { MapInitialBoundsFitter } from "./MapInitialBoundsFitter";
import { MAP_FIT_BOUNDS_PADDING } from "./mapConstants";
import type { MapFitBoundsPadding } from "./mapUtils";

interface MapContentProps {
  geoData: FeatureCollection;
  position: { center: [number, number]; zoom: number };
  mapBounds: L.LatLngBounds;
  minZoom: number;
  maxZoom: number;
  mapRef: MutableRefObject<L.Map | null>;
  getAreaStyle: (
    feature: Feature<Geometry, GeoJsonProperties> | undefined,
  ) => L.PathOptions | Record<string, unknown>;
  onEachFeature: (
    feature: Feature<Geometry, GeoJsonProperties> | undefined,
    layer: L.Layer,
  ) => void;
  setPosition: (pos: { center: [number, number]; zoom: number }) => void;
  backgroundColor?: string;
  scrollWheelZoom?: boolean;
  fitBounds?: boolean;
  fitBoundsPadding?: MapFitBoundsPadding;
  /** 0 lets fitBounds scale the geography to the container instead of snapping a full zoom level past the edges. */
  zoomSnap?: number;
}

function MapContent({
  geoData,
  position,
  mapBounds,
  minZoom,
  maxZoom,
  mapRef,
  getAreaStyle,
  onEachFeature,
  setPosition,
  backgroundColor = "var(--black-2)",
  scrollWheelZoom = true,
  fitBounds = false,
  fitBoundsPadding = MAP_FIT_BOUNDS_PADDING,
  zoomSnap,
}: MapContentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const mapId = useId();
  // Wider than the fitted view so pixel padding is not pulled back inside maxBounds.
  const panBounds = useMemo(() => mapBounds.pad(0.35), [mapBounds]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        style={{
          height: "100%",
          width: "100%",
          backgroundColor,
        }}
        className="rounded-xl"
      />
    );
  }

  return (
    <MapContainer
      key={mapId}
      center={position.center}
      zoom={position.zoom}
      style={{
        height: "100%",
        width: "100%",
        backgroundColor,
        zIndex: 0,
      }}
      zoomControl={false}
      attributionControl={false}
      maxBounds={panBounds}
      minZoom={minZoom}
      maxZoom={maxZoom}
      {...(zoomSnap !== undefined ? { zoomSnap } : {})}
      scrollWheelZoom={scrollWheelZoom}
      ref={(instance) => {
        mapRef.current = instance;
      }}
      className="rounded-xl"
    >
      <GeoJSON
        data={geoData}
        style={getAreaStyle}
        onEachFeature={onEachFeature}
      />
      {fitBounds && (
        <MapInitialBoundsFitter bounds={mapBounds} padding={fitBoundsPadding} />
      )}
      <MapController setPosition={setPosition} />
    </MapContainer>
  );
}

export default MapContent;
