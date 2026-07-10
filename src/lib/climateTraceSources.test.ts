import { describe, expect, it } from "vitest";
import {
  CLIMATE_TRACE_SOURCES_LIMIT,
  getEmissionSourceMarkerRadius,
  rankClimateTraceSources,
} from "@/lib/climateTraceSources";

describe("getEmissionSourceMarkerRadius", () => {
  it("returns larger radii for higher emissions", () => {
    const max = 10_000_000;
    expect(getEmissionSourceMarkerRadius(10_000_000, max)).toBeGreaterThan(
      getEmissionSourceMarkerRadius(100_000, max),
    );
  });

  it("keeps a minimum marker size", () => {
    expect(getEmissionSourceMarkerRadius(0, 0)).toBe(6);
  });
});

describe("rankClimateTraceSources", () => {
  it("assigns rank based on API sort order", () => {
    const ranked = rankClimateTraceSources([
      {
        id: 1,
        name: "Plant A",
        sector: "power",
        subsector: "",
        country: "SWE",
        sourceType: "point-source",
        centroid: { latitude: 1, longitude: 2, srid: 4326 },
        gas: "co2e_100yr",
        emissionsQuantity: 100,
        year: 2025,
      },
      {
        id: 2,
        name: "Plant B",
        sector: "power",
        subsector: "",
        country: "SWE",
        sourceType: "point-source",
        centroid: { latitude: 3, longitude: 4, srid: 4326 },
        gas: "co2e_100yr",
        emissionsQuantity: 50,
        year: 2025,
      },
    ]);

    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].rank).toBe(2);
  });
});

describe("CLIMATE_TRACE_SOURCES_LIMIT", () => {
  it("requests the API maximum per country", () => {
    expect(CLIMATE_TRACE_SOURCES_LIMIT).toBe(100);
  });
});
