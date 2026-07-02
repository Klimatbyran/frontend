import { describe, expect, it } from "vitest";
import { getEstimatedEmissionsAtToday } from "@/utils/data/chartYearToDate";
import { getYearProgress } from "@/utils/data/yearUtils";
import { transformEuropeanCountryEmissionsData } from "./emissionsTransforms";

describe("transformEuropeanCountryEmissionsData", () => {
  it("builds chart data with total, trend, and carbonLaw from emissions time series", () => {
    const emissionsByYear = Object.fromEntries(
      Array.from({ length: 11 }, (_, index) => {
        const year = 2015 + index;
        return [year, 1_000_000 * 0.95 ** index];
      }),
    );

    const data = transformEuropeanCountryEmissionsData(
      emissionsByYear,
      new Date("2024-01-01T00:00:00.000Z"),
    );

    expect(data.length).toBeGreaterThan(0);

    const point2015 = data.find((point) => point.year === 2015);
    expect(point2015?.total).toBe(1_000_000);
    expect(point2015?.trend).toBeDefined();
    expect(point2015?.carbonLaw).toBeUndefined();

    const point2025 = data.find((point) => point.year === 2025);
    expect(point2025?.carbonLaw).toBeDefined();
    expect(point2025?.trend).toBeDefined();
  });

  it("returns empty array when no emissions data is provided", () => {
    expect(transformEuropeanCountryEmissionsData({})).toEqual([]);
  });

  it("prorates the current year and starts projections from today", () => {
    const emissionsByYear = Object.fromEntries(
      Array.from({ length: 12 }, (_, index) => {
        const year = 2015 + index;
        return [year, 1_000_000 * 0.95 ** index];
      }),
    );
    const midYear = new Date("2026-07-02T12:00:00Z");
    const yearProgress = getYearProgress(midYear);
    const data = transformEuropeanCountryEmissionsData(
      emissionsByYear,
      midYear,
    );

    const point2026 = data.find(
      (point) => point.year > 2026 && point.year < 2027,
    );

    expect(point2026?.total).toBeCloseTo(
      getEstimatedEmissionsAtToday(
        emissionsByYear[2026],
        emissionsByYear[2025],
        2026,
        2026,
        yearProgress,
      )!,
      0,
    );
    expect(data.find((point) => point.year === 2025)?.trend).toBeUndefined();
    expect(point2026?.trend).toBeDefined();
    expect(point2026?.carbonLaw).toBeDefined();
  });
});
