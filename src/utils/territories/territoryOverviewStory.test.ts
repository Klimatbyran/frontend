import { describe, expect, it } from "vitest";
import {
  formatAnnualChange,
  lensFromSearch,
  medianChange,
  summariseExtremes,
  summariseParis,
  summarisePace,
  summarisePlans,
  type MunicipalityStoryRow,
} from "./territoryOverviewStory";

const rows: MunicipalityStoryRow[] = [
  {
    name: "Alfa",
    meetsParis: true,
    historicalEmissionChangePercent: -4,
    climatePlan: true,
  },
  {
    name: "Beta",
    meetsParis: true,
    historicalEmissionChangePercent: -1,
    climatePlan: false,
  },
  {
    name: "Gamma",
    meetsParis: false,
    historicalEmissionChangePercent: 3,
    climatePlan: true,
  },
  {
    name: "Delta",
    meetsParis: false,
    historicalEmissionChangePercent: 0.5,
    climatePlan: false,
  },
  {
    name: "Epsilon",
    meetsParis: null,
    historicalEmissionChangePercent: -2,
    climatePlan: false,
  },
];

describe("territory overview story", () => {
  it("counts the Paris split against every place", () => {
    expect(summariseParis(rows)).toEqual({
      total: 5,
      onTrack: 2,
      offTrack: 2,
      unknown: 1,
      onTrackPercent: 40,
    });
  });

  it("describes the pace around the median change", () => {
    expect(summarisePace(rows)).toEqual({
      total: 5,
      falling: 3,
      rising: 2,
      flat: 0,
      median: -1,
    });
    expect(medianChange([])).toBeNull();
  });

  it("averages the two middle values when the count is even", () => {
    expect(
      medianChange([
        {
          name: "A",
          meetsParis: true,
          historicalEmissionChangePercent: -4,
        },
        {
          name: "B",
          meetsParis: false,
          historicalEmissionChangePercent: 2,
        },
      ]),
    ).toBe(-1);
  });

  it("keeps Paris lists inside each map colour", () => {
    const extremes = summariseExtremes(rows, "paris", 5);

    expect(extremes.leading.map((row) => row.name)).toEqual(["Alfa", "Beta"]);
    expect(extremes.trailing.map((row) => row.name)).toEqual([
      "Gamma",
      "Delta",
    ]);
  });

  it("uses the raw ends of the change for the pace lens and does not repeat a place", () => {
    const extremes = summariseExtremes(rows, "pace", 2);

    expect(extremes.leading.map((row) => row.name)).toEqual([
      "Alfa",
      "Epsilon",
    ]);
    expect(extremes.trailing.map((row) => row.name)).toEqual([
      "Gamma",
      "Delta",
    ]);
  });

  it("compares climate plans with who is actually on track", () => {
    expect(summarisePlans(rows)).toMatchObject({
      withPlan: 2,
      withoutPlan: 3,
      onTrackWithPlan: 1,
      onTrackWithoutPlan: 1,
      withPlanPercent: 40,
      onTrackShareWithPlan: 50,
      onTrackShareWithoutPlan: 33,
    });
  });

  it("returns null plan shares when a group is empty", () => {
    const contrast = summarisePlans([
      {
        name: "Only",
        meetsParis: true,
        historicalEmissionChangePercent: -1,
        climatePlan: true,
      },
    ]);

    expect(contrast.onTrackShareWithPlan).toBe(100);
    expect(contrast.onTrackShareWithoutPlan).toBeNull();
  });

  it("reads the pace lens from the new param and the old kpi link", () => {
    expect(lensFromSearch("")).toBe("paris");
    expect(lensFromSearch("?kpi=meetsParisGoal")).toBe("paris");
    expect(lensFromSearch("?lens=pace")).toBe("pace");
    expect(lensFromSearch("?kpi=historicalEmissionChangePercent")).toBe("pace");
  });

  it("formats an already-percent change with a sign", () => {
    expect(formatAnnualChange(-2.5, "en")).toBe("-2.5%");
    expect(formatAnnualChange(1, "en")).toBe("+1.0%");
    expect(formatAnnualChange(-2.5, "sv")).toMatch(/[−-]2,5\s%/);
  });
});
