import { describe, expect, it } from "vitest";
import { transformEuropeanCountryEmissionsData } from "./emissionsTransforms";

describe("transformEuropeanCountryEmissionsData", () => {
  it("builds chart data with reported totals and projections from 2026", () => {
    const emissionsByYear = Object.fromEntries(
      Array.from({ length: 11 }, (_, index) => {
        const year = 2015 + index;
        return [year, 1_000_000 * 0.95 ** index];
      }),
    );

    const data = transformEuropeanCountryEmissionsData(emissionsByYear);

    expect(data.length).toBeGreaterThan(0);

    const point2015 = data.find((point) => point.year === 2015);
    expect(point2015?.total).toBe(1_000_000);
    expect(point2015?.trend).toBeUndefined();
    expect(point2015?.carbonLaw).toBeUndefined();

    const point2025 = data.find((point) => point.year === 2025);
    expect(point2025?.total).toBeDefined();
    expect(point2025?.trend).toBeUndefined();
    expect(point2025?.carbonLaw).toBeUndefined();

    const point2026 = data.find((point) => point.year === 2026);
    expect(point2026?.total).toBeUndefined();
    expect(point2026?.trend).toBeDefined();
    expect(point2026?.carbonLaw).toBeDefined();
  });

  it("returns empty array when no emissions data is provided", () => {
    expect(transformEuropeanCountryEmissionsData({})).toEqual([]);
  });

  it("ignores partial current-year totals beyond the reported end year", () => {
    const emissionsByYear = Object.fromEntries(
      Array.from({ length: 12 }, (_, index) => {
        const year = 2015 + index;
        return [year, 1_000_000 * 0.95 ** index];
      }),
    );

    const data = transformEuropeanCountryEmissionsData(emissionsByYear);

    expect(data.find((point) => point.year === 2025)?.total).toBeDefined();
    expect(data.find((point) => point.year === 2026)?.total).toBeUndefined();
    expect(data.find((point) => point.year === 2026)?.trend).toBeDefined();
    expect(data.find((point) => point.year === 2026)?.carbonLaw).toBeDefined();
  });
});
