import { describe, expect, it } from "vitest";
import {
  applyCurrentYearToDate,
  getChartYearPosition,
  isBeforeTodayOnChart,
} from "./chartYearToDate";

describe("chartYearToDate", () => {
  const midYear = new Date("2026-07-02T12:00:00Z");
  const yearProgress =
    (midYear.getTime() - Date.UTC(2026, 0, 1)) /
    (Date.UTC(2027, 0, 1) - Date.UTC(2026, 0, 1));

  it("places the current year at today's fractional position", () => {
    expect(getChartYearPosition(2026, 2026, yearProgress)).toBeCloseTo(
      2026 + yearProgress,
      5,
    );
    expect(getChartYearPosition(2025, 2026, yearProgress)).toBe(2025);
  });

  it("prorates current-year values to year-to-date", () => {
    expect(applyCurrentYearToDate(44_000, 2026, 2026, yearProgress)).toBeCloseTo(
      44_000 * yearProgress,
      5,
    );
    expect(applyCurrentYearToDate(44_000, 2025, 2026, yearProgress)).toBe(44_000);
  });

  it("hides earlier projection points during a partial current year", () => {
    expect(isBeforeTodayOnChart(2025, 2026, yearProgress)).toBe(true);
    expect(isBeforeTodayOnChart(2026, 2026, yearProgress)).toBe(false);
    expect(isBeforeTodayOnChart(2027, 2026, yearProgress)).toBe(false);
    expect(isBeforeTodayOnChart(2025, 2026, 1)).toBe(false);
  });
});
