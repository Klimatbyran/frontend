import { FeatureCollection } from "geojson";
import { MapContainer, GeoJSON } from "react-leaflet";
import type L from "leaflet";
import { MapController } from "./MapController";

interface MapContentProps {
  geoData: FeatureCollection;
  position: { center: [number, number]; zoom: number };
  mapBounds: L.LatLngBounds;
  minZoom: number;
  maxZoom: number;
  mapRef: React.RefObject<L.Map | null>;
  getAreaStyle: (feature: any) => any;
  onEachFeature: (feature: any, layer: any) => void;
  setPosition: (pos: { center: [number, number]; zoom: number }) => void;
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
}: MapContentProps) {
  return (
    <MapContainer
      center={position.center}
      zoom={position.zoom}
      style={{
        height: "100%",
        width: "100%",
        backgroundColor: "var(--black-2)",
        zIndex: 0,
      }}
      zoomControl={false}
      attributionControl={false}
      maxBounds={mapBounds}
      minZoom={minZoom}
      maxZoom={maxZoom}
      ref={mapRef}
      className="rounded-xl"
    >
      <GeoJSON
        data={geoData}
        style={getAreaStyle}
        onEachFeature={onEachFeature}
      />
      <MapController setPosition={setPosition} />
    </MapContainer>
  );
}

export default MapContent;
