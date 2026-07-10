import {
  FeatureCollection,
  Feature,
  Geometry,
  GeoJsonProperties,
} from "geojson";
import type { MutableRefObject } from "react";
import { useEffect, useId, useState } from "react";
import { MapContainer, GeoJSON } from "react-leaflet";
import type L from "leaflet";
import { MapController } from "./MapController";
import { MapInitialBoundsFitter } from "./MapInitialBoundsFitter";
import { MAP_FIT_BOUNDS_PADDING } from "./mapConstants";

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
  fitBoundsPadding?: L.FitBoundsOptions["padding"];
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
}: MapContentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const mapId = useId();

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
      maxBounds={mapBounds}
      minZoom={minZoom}
      maxZoom={maxZoom}
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
        <MapInitialBoundsFitter
          bounds={mapBounds}
          padding={fitBoundsPadding}
        />
      )}
      <MapController setPosition={setPosition} />
    </MapContainer>
  );
}

export default MapContent;
