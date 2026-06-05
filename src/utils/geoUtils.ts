import { FeatureCollection } from "geojson";

export function filterGeoDataByNames(
  geoData: FeatureCollection,
  names: Set<string>,
  propertyNameField = "name",
): FeatureCollection {
  return {
    ...geoData,
    features: geoData.features.filter((feature) => {
      const name = feature.properties?.[propertyNameField];
      return typeof name === "string" && names.has(name.toLowerCase());
    }),
  };
}
