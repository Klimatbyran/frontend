import { describe, expect, it } from "vitest";
import { transformEuropeanCountryEmissionsData } from "./emissionsTransforms";

describe("transformEuropeanCountryEmissionsData", () => {
  it("builds chart data with total, trend, and carbonLaw from emissions time series", () => {
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
    expect(point2015?.trend).toBeDefined();
    expect(point2015?.carbonLaw).toBeUndefined();

    const point2025 = data.find((point) => point.year === 2025);
    expect(point2025?.carbonLaw).toBeDefined();
    expect(point2025?.trend).toBeDefined();
  });

  it("returns empty array when no emissions data is provided", () => {
    expect(transformEuropeanCountryEmissionsData({})).toEqual([]);
  });
});
