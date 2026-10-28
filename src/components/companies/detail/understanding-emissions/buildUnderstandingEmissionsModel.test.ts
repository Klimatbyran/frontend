import { describe, expect, it } from "vitest";
import {
  buildTopScope3Categories,
  buildUnderstandingEmissionsModel,
  formatSharePercentLabel,
  widthsWithMinimum,
} from "./buildUnderstandingEmissionsModel";

describe("buildTopScope3Categories", () => {
  it("returns the largest positive categories with shares", () => {
    const drivers = buildTopScope3Categories(
      [
        { category: 1, total: 40 },
        { category: 11, total: 35 },
        { category: 4, total: 15 },
        { category: 6, total: 10 },
        { category: 2, total: 0 },
      ],
      100,
      3,
    );

    expect(drivers).toEqual([
      { category: 1, total: 40, shareOfScope3: 0.4 },
      { category: 11, total: 35, shareOfScope3: 0.35 },
      { category: 4, total: 15, shareOfScope3: 0.15 },
    ]);
  });

  it("returns null category shares when scope3 total is missing", () => {
    const drivers = buildTopScope3Categories(
      [{ category: 1, total: 40 }],
      null,
      1,
    );
    expect(drivers).toEqual([{ category: 1, total: 40, shareOfScope3: null }]);
  });
});

describe("formatSharePercentLabel", () => {
  it("formats tiny and near-complete shares without rounding to 0/100", () => {
    expect(formatSharePercentLabel(0.004)).toBe("<1%");
    expect(formatSharePercentLabel(0.996)).toBe(">99%");
    expect(formatSharePercentLabel(0.51)).toBe("51%");
    expect(formatSharePercentLabel(0.004, { includePercentSign: false })).toBe(
      "<1",
    );
    expect(formatSharePercentLabel(null)).toBeNull();
  });
});

describe("widthsWithMinimum", () => {
  it("renormalizes when minimums would exceed 100%", () => {
    const widths = widthsWithMinimum([0.95, 0.05], 12);
    expect(widths[0]! + widths[1]!).toBeCloseTo(100, 5);
    expect(widths[1]!).toBeGreaterThanOrEqual(12 * (100 / (95 + 12)));
  });
});

describe("buildUnderstandingEmissionsModel", () => {
  it("builds own vs value-chain shares against the calculated total", () => {
    const model = buildUnderstandingEmissionsModel({
      year: "2024",
      total: 1000,
      scope1: 100,
      scope2: 200,
      scope3: 700,
      scope3Categories: [{ category: 1, total: 500 }],
    });

    expect(model.year).toBe("2024");
    expect(model.hasAnyScopeData).toBe(true);
    expect(model.hasOwnData).toBe(true);
    expect(model.hasValueChainData).toBe(true);
    expect(model.isPartialSplit).toBe(false);
    expect(model.own).toBe(300);
    expect(model.valueChain).toBe(700);
    expect(model.shares).toEqual({
      scope1: 0.1,
      scope2: 0.2,
      scope3: 0.7,
      own: 0.3,
      valueChain: 0.7,
    });
    expect(model.ownInternalShares).toEqual({
      scope1: 100 / 300,
      scope2: 200 / 300,
    });
    expect(model.topScope3Categories[0]?.category).toBe(1);
  });

  it("falls back to known scope sum for shares when total is missing", () => {
    const model = buildUnderstandingEmissionsModel({
      year: "2023",
      total: null,
      scope1: 25,
      scope2: 75,
      scope3: null,
    });

    expect(model.total).toBeNull();
    expect(model.knownScopeSum).toBe(100);
    expect(model.own).toBe(100);
    expect(model.hasOwnData).toBe(true);
    expect(model.hasValueChainData).toBe(false);
    expect(model.isPartialSplit).toBe(true);
    expect(model.shares.scope1).toBe(0.25);
    expect(model.shares.scope2).toBe(0.75);
    expect(model.shares.own).toBe(1);
    expect(model.shares.scope3).toBeNull();
    expect(model.shares.valueChain).toBeNull();
  });

  it("marks hasAnyScopeData false when no scopes are reported", () => {
    const model = buildUnderstandingEmissionsModel({
      year: "2022",
      total: null,
      scope1: null,
      scope2: null,
      scope3: null,
    });

    expect(model.hasAnyScopeData).toBe(false);
    expect(model.own).toBeNull();
    expect(model.isPartialSplit).toBe(false);
  });

  it("treats a steel-heavy profile as mostly own operations", () => {
    const model = buildUnderstandingEmissionsModel({
      year: "2023",
      total: 1000,
      scope1: 700,
      scope2: 100,
      scope3: 200,
    });

    expect(model.shares.own).toBe(0.8);
    expect(model.shares.valueChain).toBe(0.2);
  });

  it("treats a retail-heavy profile as mostly value chain", () => {
    const model = buildUnderstandingEmissionsModel({
      year: "2023",
      total: 1000,
      scope1: 20,
      scope2: 30,
      scope3: 950,
    });

    expect(model.shares.own).toBe(0.05);
    expect(model.shares.valueChain).toBe(0.95);
  });

  it("flags value-chain-only reporting as a partial split", () => {
    const model = buildUnderstandingEmissionsModel({
      year: "2024",
      total: 500,
      scope1: null,
      scope2: null,
      scope3: 500,
    });

    expect(model.hasOwnData).toBe(false);
    expect(model.hasValueChainData).toBe(true);
    expect(model.isPartialSplit).toBe(true);
    expect(model.shares.own).toBeNull();
    expect(model.shares.valueChain).toBe(1);
  });
});
