import { describe, expect, it } from "vitest";
import {
  buildIndustryBreakdown,
  fastestCutters,
  furthestBehind,
  latestEmissions,
  parisDotCompanies,
  summariseParis,
  summariseReporting,
  type OverviewCompany,
} from "./parisOverviewUtils";

function company(
  name: string,
  sectorCode: string,
  meetsParis: boolean | null,
  change: number | null,
  emissions: number,
): OverviewCompany {
  return {
    id: name,
    name,
    wikidataId: null,
    sectorCode,
    meetsParis,
    emissionsChangeFromBaseYear: change,
    latestTotalEmissions: emissions,
  };
}

describe("summariseReporting", () => {
  it("counts a Paris verdict as enough and a missing verdict as too little", () => {
    expect(
      summariseReporting([
        { meetsParis: true },
        { meetsParis: false },
        { meetsParis: true },
        { meetsParis: null },
        { meetsParis: undefined },
      ]),
    ).toEqual({
      total: 5,
      enough: 3,
      tooLittle: 2,
    });
  });
});

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
});

describe("summariseParis", () => {
  const companies = [
    company("On A", "15", true, -40, 100),
    company("On B", "15", true, -30, 100),
    company("Off A", "35", false, -5, 100),
    company("Off B", "35", false, 12, 100),
    company("Unknown", "35", null, null, 100),
  ];

  it("splits the selection into on track, off track and unjudged", () => {
    const summary = summariseParis(companies);

    expect(summary).toEqual({
      total: 5,
      onTrack: 2,
      offTrack: 2,
      unknown: 1,
      onTrackPercent: 40,
    });
  });
});

describe("buildIndustryBreakdown", () => {
  it("orders industries by emissions", () => {
    const rows = buildIndustryBreakdown([
      company("A", "15", true, -10, 50),
      company("B", "35", false, 10, 200),
      company("C", "35", true, -5, 100),
    ]);

    expect(rows.map((row) => row.code)).toEqual(["35", "15"]);
    expect(rows[0].emissions).toBe(300);
  });
});

describe("fastestCutters / furthestBehind", () => {
  const companies = [
    company("Deep Cut", "15", true, -80, 100),
    company("Small Cut", "15", true, -10, 100),
    company("Growing", "15", false, 40, 100),
    company("Slow Cut", "15", false, -2, 100),
  ];

  it("picks on-track companies with the deepest cuts", () => {
    expect(fastestCutters(companies, 1).map((c) => c.name)).toEqual([
      "Deep Cut",
    ]);
  });

  it("picks off-track companies with the worst change", () => {
    expect(furthestBehind(companies, 1).map((c) => c.name)).toEqual([
      "Growing",
    ]);
  });
});

describe("parisDotCompanies", () => {
  it("keeps only judged companies and puts on-track first", () => {
    const dots = parisDotCompanies([
      company("Z Off", "15", false, 1, 10),
      company("A On", "15", true, -1, 10),
      company("Unknown", "15", null, null, 10),
    ]);

    expect(dots.map((dot) => dot.name)).toEqual(["A On", "Z Off"]);
  });
});
