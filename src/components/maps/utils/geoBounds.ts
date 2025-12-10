import { FeatureCollection, Geometry } from "geojson";
import L from "leaflet";

/**
 * Default bounds for Sweden (used as fallback)
 */
const DEFAULT_SWEDEN_BOUNDS: [[number, number], [number, number]] = [
  [55.3, 11.0], // Southwest corner
  [69.1, 24.2], // Northeast corner
];

/**
 * Extracts all coordinates from a GeoJSON geometry
 */
function extractCoordinates(
  geometry: Geometry,
  allCoordinates: [number, number][],
): void {
  switch (geometry.type) {
    case "Point":
      allCoordinates.push([geometry.coordinates[1], geometry.coordinates[0]]);
      break;

    case "LineString":
      geometry.coordinates.forEach((coord) => {
        allCoordinates.push([coord[1], coord[0]]);
      });
      break;

    case "Polygon":
      geometry.coordinates.forEach((ring) => {
        ring.forEach((coord) => {
          allCoordinates.push([coord[1], coord[0]]);
        });
      });
      break;

    case "MultiPoint":
      geometry.coordinates.forEach((coord) => {
        allCoordinates.push([coord[1], coord[0]]);
      });
      break;

    case "MultiLineString":
      geometry.coordinates.forEach((line) => {
        line.forEach((coord) => {
          allCoordinates.push([coord[1], coord[0]]);
        });
      });
      break;

    case "MultiPolygon":
      geometry.coordinates.forEach((polygon) => {
        polygon.forEach((ring) => {
          ring.forEach((coord) => {
            allCoordinates.push([coord[1], coord[0]]);
          });
        });
      });
      break;
  }
}

export interface CalculateBoundsOptions {
  /**
   * Padding percentage to add around the bounds (default: 0.05 = 5%)
   */
  padding?: number;
  fallbackBounds?: [[number, number], [number, number]];
}

/**
 * @param geoData - The GeoJSON FeatureCollection to calculate bounds from
 * @param options - Optional configuration for padding and fallback bounds
 * @returns Leaflet LatLngBounds object
 */
export function calculateGeoBounds(
  geoData: FeatureCollection | null | undefined,
  options: CalculateBoundsOptions = {},
): L.LatLngBounds {
  const { padding = 0.05, fallbackBounds = DEFAULT_SWEDEN_BOUNDS } = options;

  if (!geoData || !geoData.features || geoData.features.length === 0) {
    return L.latLngBounds(fallbackBounds[0], fallbackBounds[1]);
  }

  const allCoordinates: [number, number][] = [];

  geoData.features.forEach((feature) => {
    if (feature.geometry) {
      extractCoordinates(feature.geometry, allCoordinates);
    }
  });

  if (allCoordinates.length === 0) {
    return L.latLngBounds(fallbackBounds[0], fallbackBounds[1]);
  }

  // Calculate bounding box
  const lats = allCoordinates.map((coord) => coord[0]);
  const lngs = allCoordinates.map((coord) => coord[1]);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Add padding to allow some panning flexibility
  const latPadding = (maxLat - minLat) * padding;
  const lngPadding = (maxLng - minLng) * padding;

  return L.latLngBounds(
    [minLat - latPadding, minLng - lngPadding],
    [maxLat + latPadding, maxLng + lngPadding],
  );
}
