import { describe, expect, it } from "vitest";
import {
  compareCompaniesToRegions,
  compareCompanySourcesToRegions,
  latestReportedCompanyEmissions,
  normalizePlaceName,
  type RegionTerritorialInput,
} from "./regionCompanyComparison";

const regions: RegionTerritorialInput[] = [
  {
    name: "Skåne län",
    emissionsByYear: { "2022": 100, "2023": 200 },
  },
  {
    name: "Västra Götalands län",
    emissionsByYear: { "2023": 400 },
  },
  {
    name: "Stockholms län",
    emissionsByYear: { "2023": 800 },
  },
  {
    name: "Gotlands län",
    emissionsByYear: { "2022": 10 },
  },
];

describe("normalizePlaceName", () => {
  it("strips a trailing place suffix once", () => {
    expect(normalizePlaceName("  Malmö kommun ")).toBe("Malmö");
    expect(normalizePlaceName("Göteborgs stad")).toBe("Göteborgs");
    expect(normalizePlaceName("Skåne län")).toBe("Skåne");
  });
});

describe("latestReportedCompanyEmissions", () => {
  it("uses the latest period and ignores a missing total", () => {
    expect(
      latestReportedCompanyEmissions([
        {
          endDate: "2022-12-31",
          emissions: { calculatedTotalEmissions: 10 },
        },
        {
          endDate: "2024-06-30",
          emissions: { calculatedTotalEmissions: null },
        },
      ]),
    ).toEqual({ reportedYear: 2024, reportedEmissions: null });
  });
});

describe("compareCompanySourcesToRegions", () => {
  it("sums company reports in the region for a municipality, city, or län", () => {
    const result = compareCompanySourcesToRegions(
      [
        {
          id: "malmo",
          municipality: "Malmö",
          reportingPeriods: [
            {
              endDate: "2024-12-31",
              emissions: { calculatedTotalEmissions: 50 },
            },
          ],
        },
        {
          id: "helsingborg",
          city: "Helsingborgs stad",
          reportingPeriods: [
            {
              endDate: "2023-12-31",
              emissions: { calculatedTotalEmissions: 25 },
            },
          ],
        },
        {
          id: "gothenburg",
          location: "Göteborg",
          reportingPeriods: [
            {
              endDate: "2024-12-31",
              emissions: { calculatedTotalEmissions: 80 },
            },
          ],
        },
        {
          id: "stockholm-region",
          region: "Stockholms län",
          reportingPeriods: [
            {
              endDate: "2024-12-31",
              emissions: { calculatedTotalEmissions: 100 },
            },
          ],
        },
      ],
      regions,
    );

    const skane = result.regions.find(
      (region) => region.regionName === "Skåne län",
    );
    const vg = result.regions.find(
      (region) => region.regionName === "Västra Götalands län",
    );
    const stockholm = result.regions.find(
      (region) => region.regionName === "Stockholms län",
    );

    expect(skane).toMatchObject({
      companyCount: 2,
      companyEmissions: 75,
      territorialYear: 2023,
      territorialEmissions: 200,
      shareOfTerritorial: 75 / 200,
      relationship: "regional-share",
      mapName: "Skåne",
    });
    expect(vg).toMatchObject({
      companyCount: 1,
      companyEmissions: 80,
      shareOfTerritorial: 80 / 400,
      relationship: "regional-share",
    });
    expect(stockholm).toMatchObject({
      companyCount: 1,
      companyEmissions: 100,
      relationship: "regional-share",
    });
    expect(result.placedCompanyCount).toBe(4);
    expect(result.unplacedCompanyCount).toBe(0);
    expect(result.colorMode).toBe("company-share");
    expect(skane?.mapValue).toBe((75 / 200) * 100);
    expect(
      result.regions.find((region) => region.regionName === "Gotlands län")
        ?.mapValue,
    ).toBeNull();
    expect(result.companyYearMin).toBe(2023);
    expect(result.companyYearMax).toBe(2024);
  });

  it("skips companies that cannot be placed and does not invent a regional sum", () => {
    const result = compareCompanySourcesToRegions(
      [
        {
          id: "oslo",
          city: "Oslo",
          reportingPeriods: [
            {
              endDate: "2024-12-31",
              emissions: { calculatedTotalEmissions: 999 },
            },
          ],
        },
        {
          id: "ambiguous",
          tags: ["Malmö", "Göteborg"],
          reportingPeriods: [
            {
              endDate: "2024-12-31",
              emissions: { calculatedTotalEmissions: 10 },
            },
          ],
        },
        {
          id: "blank",
          municipality: "   ",
          tags: ["sweden"],
          reportingPeriods: [
            {
              endDate: "2024-12-31",
              emissions: { calculatedTotalEmissions: 5 },
            },
          ],
        },
        {
          id: "no-total",
          municipality: "Malmö",
          reportingPeriods: [
            {
              endDate: "2024-12-31",
              emissions: { calculatedTotalEmissions: null },
            },
          ],
        },
      ],
      regions,
    );

    const skane = result.regions.find(
      (region) => region.regionName === "Skåne län",
    );
    const gotland = result.regions.find(
      (region) => region.regionName === "Gotlands län",
    );

    expect(result.placedCompanyCount).toBe(1);
    expect(result.unplacedCompanyCount).toBe(3);
    expect(skane).toMatchObject({
      companyCount: 1,
      companyEmissions: null,
      relationship: "placed-without-emissions",
      shareOfTerritorial: null,
    });
    expect(gotland).toMatchObject({
      companyCount: 0,
      companyEmissions: null,
      territorialEmissions: null,
      relationship: "missing-territorial",
    });
    expect(result.companyEmissions).toBe(999 + 10 + 5);
    expect(result.anyRegionalCompanyEmissions).toBe(false);
  });

  it("compares the national company total with each region when nobody can be placed", () => {
    const result = compareCompaniesToRegions(
      [
        {
          id: "a",
          location: null,
          reportedEmissions: 300,
          reportedYear: 2024,
        },
        {
          id: "b",
          location: null,
          reportedEmissions: 100,
          reportedYear: 2024,
        },
      ],
      regions,
    );

    const stockholm = result.regions.find(
      (region) => region.regionName === "Stockholms län",
    );

    expect(result.placedCompanyCount).toBe(0);
    expect(result.unplacedCompanyCount).toBe(2);
    expect(result.companyEmissions).toBe(400);
    expect(result.nationalTerritorialEmissions).toBe(200 + 400 + 800);
    expect(result.colorMode).toBe("territorial-share");
    expect(stockholm).toMatchObject({
      relationship: "national-scale",
      nationalScaleRatio: 400 / 800,
      territorialShareOfSweden: 800 / 1400,
      mapValue: (800 / 1400) * 100,
      companyEmissions: null,
      companyCount: 0,
    });
  });

  it("matches a place tag only when every tag points at the same region", () => {
    const result = compareCompanySourcesToRegions(
      [
        {
          id: "tagged",
          tags: ["sweden", "Lund"],
          reportingPeriods: [
            {
              endDate: "2024-12-31",
              emissions: { calculatedTotalEmissions: 12 },
            },
          ],
        },
      ],
      regions,
    );

    expect(
      result.regions.find((region) => region.regionName === "Skåne län"),
    ).toMatchObject({
      companyCount: 1,
      companyEmissions: 12,
    });
  });

  it("does not let an unmatched city fall through to a place tag", () => {
    const result = compareCompanySourcesToRegions(
      [
        {
          id: "foreign-hq",
          city: "Oslo",
          tags: ["Malmö"],
          reportingPeriods: [
            {
              endDate: "2024-12-31",
              emissions: { calculatedTotalEmissions: 12 },
            },
          ],
        },
      ],
      regions,
    );

    expect(result.placedCompanyCount).toBe(0);
    expect(result.regions.every((region) => region.companyCount === 0)).toBe(
      true,
    );
  });
});
