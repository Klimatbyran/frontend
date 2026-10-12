import { describe, expect, it } from "vitest";
import type { ReportingPeriod } from "@/types/company";
import {
  buildTopScope3Categories,
  buildUnderstandingEmissionsModel,
  getScopeValues,
} from "./buildUnderstandingEmissionsModel";

function makePeriod(emissions: ReportingPeriod["emissions"]): ReportingPeriod {
  return {
    id: "period-1",
    startDate: "2024-01-01T00:00:00.000Z",
    endDate: "2024-12-31T00:00:00.000Z",
    reportURL: null,
    emissions,
    economy: null,
  } as ReportingPeriod;
}

describe("getScopeValues", () => {
  it("returns nulls when emissions are missing", () => {
    expect(getScopeValues(null)).toEqual({
      scope1: null,
      scope2: null,
      scope3: null,
      total: null,
    });
  });

  it("reads scope totals from the emissions object", () => {
    expect(
      getScopeValues({
        calculatedTotalEmissions: 1000,
        scope1: { total: 100, unit: "tCO2e" },
        scope2: { calculatedTotalEmissions: 200, unit: "tCO2e" },
        scope3: { calculatedTotalEmissions: 700, categories: [] },
      } as never),
    ).toEqual({
      scope1: 100,
      scope2: 200,
      scope3: 700,
      total: 1000,
    });
  });
});

describe("buildTopScope3Categories", () => {
  it("returns the largest positive categories with shares", () => {
    const drivers = buildTopScope3Categories(
      {
        scope3: {
          calculatedTotalEmissions: 100,
          categories: [
            { category: 1, total: 40, unit: "tCO2e" },
            { category: 11, total: 35, unit: "tCO2e" },
            { category: 4, total: 15, unit: "tCO2e" },
            { category: 6, total: 10, unit: "tCO2e" },
            { category: 2, total: 0, unit: "tCO2e" },
          ],
        },
      } as never,
      3,
    );

    expect(drivers).toEqual([
      { category: 1, total: 40, shareOfScope3: 0.4 },
      { category: 11, total: 35, shareOfScope3: 0.35 },
      { category: 4, total: 15, shareOfScope3: 0.15 },
    ]);
  });
});

describe("buildUnderstandingEmissionsModel", () => {
  it("builds shares against the calculated total when present", () => {
    const model = buildUnderstandingEmissionsModel(
      makePeriod({
        calculatedTotalEmissions: 1000,
        scope1: { total: 100, unit: "tCO2e" },
        scope2: { calculatedTotalEmissions: 200, unit: "tCO2e" },
        scope3: {
          calculatedTotalEmissions: 700,
          categories: [{ category: 1, total: 500, unit: "tCO2e" }],
        },
      } as never),
      "2024",
    );

    expect(model.year).toBe("2024");
    expect(model.hasAnyScopeData).toBe(true);
    expect(model.shares).toEqual({
      scope1: 0.1,
      scope2: 0.2,
      scope3: 0.7,
    });
    expect(model.topScope3Categories[0]?.category).toBe(1);
  });

  it("falls back to known scope sum for shares when total is missing", () => {
    const model = buildUnderstandingEmissionsModel(
      makePeriod({
        calculatedTotalEmissions: null,
        scope1: { total: 25, unit: "tCO2e" },
        scope2: { calculatedTotalEmissions: 75, unit: "tCO2e" },
        scope3: null,
      } as never),
      "2023",
    );

    expect(model.total).toBeNull();
    expect(model.knownScopeSum).toBe(100);
    expect(model.shares.scope1).toBe(0.25);
    expect(model.shares.scope2).toBe(0.75);
    expect(model.shares.scope3).toBeNull();
  });

  it("marks hasAnyScopeData false when no scopes are reported", () => {
    const model = buildUnderstandingEmissionsModel(
      makePeriod({
        calculatedTotalEmissions: null,
        scope1: null,
        scope2: null,
        scope3: null,
      } as never),
      "2022",
    );

    expect(model.hasAnyScopeData).toBe(false);
  });
});
