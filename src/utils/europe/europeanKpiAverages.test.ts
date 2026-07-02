import { describe, expect, it } from "vitest";
import { FeatureCollection } from "geojson";
import { calculateEuropeanKpiAverages } from "@/utils/europe/europeanKpiAverages";
import { CLIMATE_TRACE_REPORTED_END_YEAR } from "@/utils/europe/climateTraceKpis";

const geoData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { ISO3: "SWE", ISO2: "SE", NAME: "Sweden" },
      geometry: null,
    },
    {
      type: "Feature",
      properties: { ISO3: "NOR", ISO2: "NO", NAME: "Norway" },
      geometry: null,
    },
    {
      type: "Feature",
      properties: { ISO3: "XXX", ISO2: "XX", NAME: "No data" },
      geometry: null,
    },
  ],
} as FeatureCollection;

describe("calculateEuropeanKpiAverages", () => {
  it("averages KPI values across countries with Climate TRACE data", () => {
    const averages = calculateEuropeanKpiAverages(geoData, {
      SWE: {
        rank: 1,
        country: "SWE",
        name: "Sweden",
        gas: "co2e_100yr",
        emissionsQuantity: 50_000_000,
        emissionsPerCapita: 4,
        percentage: 1,
        emissionsByYear: { [CLIMATE_TRACE_REPORTED_END_YEAR]: 50_000_000 },
        historicalEmissionChangePercent: -2,
        meetsParis: true,
      },
      NOR: {
        rank: 2,
        country: "NOR",
        name: "Norway",
        gas: "co2e_100yr",
        emissionsQuantity: 30_000_000,
        emissionsPerCapita: 6,
        percentage: 1,
        emissionsByYear: { [CLIMATE_TRACE_REPORTED_END_YEAR]: 30_000_000 },
        historicalEmissionChangePercent: -4,
        meetsParis: true,
      },
    });

    expect(averages.historicalEmissionChangePercent).toBe(-3);
    expect(averages.totalEmissions2025).toBe(40_000_000);
    expect(averages.emissionsPerCapita).toBe(5);
  });

  it("returns null averages when no countries have data", () => {
    const averages = calculateEuropeanKpiAverages(geoData, {});

    expect(averages.historicalEmissionChangePercent).toBeNull();
    expect(averages.totalEmissions2025).toBeNull();
    expect(averages.emissionsPerCapita).toBeNull();
  });
});
