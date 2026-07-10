import { FeatureCollection } from "geojson";

export function filterEuropeGeoByIso3(
  geoData: FeatureCollection,
  iso3: string,
): FeatureCollection {
  const normalizedIso3 = iso3.toUpperCase();

  return {
    ...geoData,
    features: geoData.features.filter(
      (feature) =>
        typeof feature.properties?.ISO3 === "string" &&
        feature.properties.ISO3.toUpperCase() === normalizedIso3,
    ),
  };
}
