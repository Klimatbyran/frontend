import { describe, expect, it } from "vitest";
import { latestEmissions, overviewSectorCode } from "./parisOverviewUtils";

describe("latestEmissions", () => {
  it("returns null when the latest total is missing", () => {
    expect(
      latestEmissions({
        id: "x",
        name: "x",
        sectorCode: "15",
        meetsParis: null,
        emissionsChangeFromBaseYear: null,
        latestTotalEmissions: null,
      }),
    ).toBeNull();
  });

  it("returns a finite total", () => {
    expect(
      latestEmissions({
        id: "x",
        name: "x",
        sectorCode: "15",
        meetsParis: true,
        emissionsChangeFromBaseYear: -10,
        latestTotalEmissions: 42,
      }),
    ).toBe(42);
  });
});

describe("overviewSectorCode", () => {
  it("returns undefined when sector is missing", () => {
    expect(
      overviewSectorCode({
        id: "x",
        name: "x",
        sectorCode: null,
        meetsParis: null,
        emissionsChangeFromBaseYear: null,
        latestTotalEmissions: null,
      }),
    ).toBeUndefined();
  });
});
