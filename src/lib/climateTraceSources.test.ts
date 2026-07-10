import { describe, expect, it } from "vitest";
import {
  CLIMATE_TRACE_SOURCES_LIMIT,
  getEmissionSourceMarkerRadius,
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

describe("CLIMATE_TRACE_SOURCES_LIMIT", () => {
  it("requests the API maximum per country", () => {
    expect(CLIMATE_TRACE_SOURCES_LIMIT).toBe(100);
  });
});
