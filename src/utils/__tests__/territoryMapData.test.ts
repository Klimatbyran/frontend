import {
  normalizeMunicipalityKpiApiItem,
  toMunicipalityMapDataItem,
  toRegionMapDataItem,
} from "../territoryMapData";

describe("normalizeMunicipalityKpiApiItem", () => {
  it("maps meetsParis to meetsParisGoal", () => {
    expect(
      normalizeMunicipalityKpiApiItem({
        name: "Göteborg",
        meetsParis: true,
        historicalEmissionChangePercent: -2,
      }),
    ).toEqual({
      name: "Göteborg",
      meetsParisGoal: true,
      historicalEmissionChangePercent: -2,
    });
  });
});

describe("toRegionMapDataItem", () => {
  it("uses map region name for map identity fields", () => {
    expect(
      toRegionMapDataItem({
        name: "Stockholms län",
        historicalEmissionChangePercent: -1.2,
        meetsParis: false,
      }),
    ).toMatchObject({
      id: "Stockholm",
      name: "Stockholm",
      displayName: "Stockholms län",
      historicalEmissionChangePercent: -1.2,
    });
  });
});

describe("toMunicipalityMapDataItem", () => {
  it("normalizes municipality KPI data for map rendering", () => {
    expect(
      toMunicipalityMapDataItem({
        name: "Göteborg",
        meetsParis: false,
        historicalEmissionChangePercent: 0.5,
      }),
    ).toMatchObject({
      id: "Göteborg",
      name: "Göteborg",
      displayName: "Göteborg",
      meetsParisGoal: false,
      historicalEmissionChangePercent: 0.5,
    });
  });
});
