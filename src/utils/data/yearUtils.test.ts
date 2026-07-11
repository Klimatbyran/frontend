import { describe, expect, it } from "vitest";
import {
  getCurrentYearChartPosition,
  getYearProgress,
  formatChartYearLabel,
} from "./yearUtils";

describe("getYearProgress", () => {
  it("returns 0 at the start of the year", () => {
    expect(getYearProgress(new Date("2026-01-01T00:00:00Z"))).toBe(0);
  });

  it("returns a value between 0 and 1 mid-year", () => {
    const progress = getYearProgress(new Date("2026-07-02T12:00:00Z"));
    expect(progress).toBeGreaterThan(0.4);
    expect(progress).toBeLessThan(0.6);
  });
});

describe("getCurrentYearChartPosition", () => {
  it("returns calendar year plus elapsed fraction", () => {
    const date = new Date("2026-07-02T12:00:00Z");
    expect(getCurrentYearChartPosition(date)).toBeCloseTo(
      2026 + getYearProgress(date),
      5,
    );
  });
});

describe("formatChartYearLabel", () => {
  it("formats a fractional chart year as a calendar date", () => {
    const label = formatChartYearLabel(
      2026 + getYearProgress(new Date(2026, 6, 2, 12, 0, 0)),
      "en",
    );
    expect(label).toContain("2026");
    expect(label.toLowerCase()).toMatch(/jul/);
  });
});
