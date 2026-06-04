import { FeatureCollection } from "geojson";
import { filterGeoDataByNames } from "../geoUtils";

const geoData: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Alpha" },
      geometry: { type: "Point", coordinates: [0, 0] },
    },
    {
      type: "Feature",
      properties: { name: "Beta" },
      geometry: { type: "Point", coordinates: [1, 1] },
    },
    {
      type: "Feature",
      properties: { name: "Gamma" },
      geometry: { type: "Point", coordinates: [2, 2] },
    },
  ],
};

describe("filterGeoDataByNames", () => {
  it("keeps features whose names match the set case-insensitively", () => {
    const result = filterGeoDataByNames(geoData, new Set(["alpha", "gamma"]));

    expect(result.features.map((f) => f.properties?.name)).toEqual([
      "Alpha",
      "Gamma",
    ]);
  });

  it("returns an empty feature collection when no names match", () => {
    const result = filterGeoDataByNames(geoData, new Set(["missing"]));

    expect(result.features).toHaveLength(0);
    expect(result.type).toBe("FeatureCollection");
  });

  it("ignores features without a string name property", () => {
    const withInvalidName: FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: 123 },
          geometry: { type: "Point", coordinates: [0, 0] },
        },
      ],
    };

    expect(
      filterGeoDataByNames(withInvalidName, new Set(["123"])).features,
    ).toHaveLength(0);
  });
});
