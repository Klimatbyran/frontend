import { describe, expect, it } from "vitest";
import { FeatureCollection } from "geojson";
import { filterEuropeGeoByIso3 } from "@/utils/europe/countryGeo";

const geoData: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { ISO3: "SWE", NAME: "Sweden" },
      geometry: { type: "Polygon", coordinates: [] },
    },
    {
      type: "Feature",
      properties: { ISO3: "DEU", NAME: "Germany" },
      geometry: { type: "Polygon", coordinates: [] },
    },
  ],
};

describe("filterEuropeGeoByIso3", () => {
  it("returns only the matching country feature", () => {
    const filtered = filterEuropeGeoByIso3(geoData, "swe");

    expect(filtered.features).toHaveLength(1);
    expect(filtered.features[0].properties?.NAME).toBe("Sweden");
  });
});
